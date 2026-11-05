const http = require('http');
const https = require('https');
const { assertPublicHttpUrl } = require('./safeUrl');

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']);

const entryCount = (rows) => {
  if (!rows || !rows.length) return undefined;
  const row = rows[0];
  if (row && typeof row === 'object' && Object.prototype.hasOwnProperty.call(row, 'entries')) {
    return Number(row.entries);
  }
  return Number(row);
};

const handleImage = (req, res, db) => {
  db('users')
    .where('id', '=', req.userId)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      const count = entryCount(entries);
      if (!Number.isFinite(count)) {
        return res.status(400).json('unable to get entries');
      }
      res.json(count);
    })
    .catch(() => res.status(400).json('unable to get entries'));
};

const readLimited = (response) => new Promise((resolve, reject) => {
  const chunks = [];
  let received = 0;
  response.on('data', (chunk) => {
    received += chunk.length;
    if (received > MAX_IMAGE_BYTES) {
      response.destroy();
      reject(new Error('image is empty or too large'));
      return;
    }
    chunks.push(chunk);
  });
  response.on('end', () => resolve(Buffer.concat(chunks)));
  response.on('error', reject);
});

const requestPinned = (url, address, family) => new Promise((resolve, reject) => {
  const lib = url.protocol === 'https:' ? https : http;
  const req = lib.request(url, {
    method: 'GET',
    timeout: 10000,
    lookup(hostname, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (options && options.all) {
        callback(null, [{ address, family }]);
        return;
      }
      callback(null, address, family);
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
    }
  }, resolve);
  req.on('error', reject);
  req.on('timeout', () => req.destroy(new Error('unable to fetch image')));
  req.end();
});

const fetchPublicImage = async (rawUrl) => {
  let current = rawUrl;

  for (let hop = 0; hop < 4; hop += 1) {
    const { url, address, family } = await assertPublicHttpUrl(current);
    const response = await requestPinned(url, address, family);
    if (response.statusCode >= 300 && response.statusCode < 400) {
      const location = response.headers.location;
      response.resume();
      if (!location) {
        throw new Error('unable to fetch image');
      }
      current = new URL(location, url).href;
      continue;
    }
    return response;
  }

  throw new Error('unable to fetch image');
};

const handleImageProxy = async (req, res) => {
  if (typeof req.query.url !== 'string') {
    return res.status(400).json('invalid image url');
  }

  try {
    const response = await fetchPublicImage(req.query.url);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      response.resume();
      return res.status(400).json('unable to fetch image');
    }

    const contentType = (response.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.has(contentType)) {
      response.resume();
      return res.status(400).json('url is not an image');
    }

    const bytes = await readLimited(response);
    if (!bytes.length) {
      return res.status(400).json('image is empty or too large');
    }

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(bytes);
  } catch (err) {
    const message = err.message === 'url is not allowed' || err.message === 'invalid image url'
      ? err.message
      : 'unable to fetch image';
    res.status(400).json(message);
  }
};

module.exports = {
  handleImage,
  handleImageProxy
};
