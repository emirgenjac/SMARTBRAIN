const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3030';

export function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });
}

export default API_URL;
