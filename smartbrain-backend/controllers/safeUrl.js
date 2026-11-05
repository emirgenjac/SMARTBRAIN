const dns = require('dns').promises;
const net = require('net');

const isPrivateAddress = (ip) => {
  const version = net.isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === '::' || normalized === '::1') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    if (normalized.startsWith('fe80')) return true;
    if (normalized.startsWith('::ffff:')) {
      return isPrivateAddress(normalized.slice('::ffff:'.length));
    }
    return false;
  }

  return true;
};

const blockedHostname = (hostname) => {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === 'localhost'
    || host.endsWith('.localhost')
    || host.endsWith('.local')
    || host.endsWith('.internal');
};

const assertPublicHttpUrl = async (raw) => {
  let url;
  try {
    url = new URL(raw);
  } catch (err) {
    throw new Error('invalid image url');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('invalid image url');
  }
  if (url.username || url.password) {
    throw new Error('invalid image url');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (!hostname || blockedHostname(hostname)) {
    throw new Error('url is not allowed');
  }

  let records;
  if (net.isIP(hostname)) {
    records = [{ address: hostname, family: net.isIP(hostname) }];
  } else {
    records = await dns.lookup(hostname, { all: true });
  }

  if (!records.length || records.some((record) => isPrivateAddress(record.address))) {
    throw new Error('url is not allowed');
  }

  const chosen = records[0];
  return { url, address: chosen.address, family: chosen.family };
};

module.exports = {
  assertPublicHttpUrl
};
