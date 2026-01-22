const normalizeUrl = (url) => url.replace(/\/+$/, '');

const resolveProtocol = () => {
  if (typeof window !== 'undefined' && window.location?.protocol) {
    return window.location.protocol.includes('https') ? 'https' : 'http';
  }
  return 'http';
};

const resolveHostname = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname || 'localhost';
  }
  return 'localhost';
};

const resolvePort = () => {
  const envPort = import.meta.env.VITE_API_PORT;
  if (envPort) return envPort.toString();
  return '3000';
};

const getLocalNetworkIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Failed to get public IP, falling back to localhost');
    return 'localhost';
  }
};

export const getApiUrl = async () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) return normalizeUrl(envUrl);

  const protocol = resolveProtocol();
  const hostname = resolveHostname();
  const port = resolvePort();

  return `${protocol}://${hostname}${port ? `:${port}` : ''}`;
};

export const getAutoApiUrl = async () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) return normalizeUrl(envUrl);

  try {
    const localIP = await getLocalNetworkIP();
    const protocol = resolveProtocol();
    const port = resolvePort();
    return `${protocol}://${localIP}:${port}`;
  } catch (error) {
    console.warn('Failed to auto-detect IP, using localhost');
    const protocol = resolveProtocol();
    const hostname = resolveHostname();
    const port = resolvePort();
    return `${protocol}://${hostname}${port ? `:${port}` : ''}`;
  }
};

export const API_URL = getApiUrl();
