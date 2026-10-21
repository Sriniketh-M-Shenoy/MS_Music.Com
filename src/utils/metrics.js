// Realtime Analytics & Counter Utility using API Ninjas
export const API_KEY = 'd43hYDZXlvx2kymEjDOHk8hxdmbdDCtqSZEQZ04h';
export const COUNTER_BASE_URL = 'https://api.api-ninjas.com/v1/counter';

export function sanitizeCounterId(name) {
  if (!name) return 'counter_default';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
}

export async function incrementCounter(counterName) {
  try {
    const id = sanitizeCounterId(counterName);
    const res = await fetch(`${COUNTER_BASE_URL}?id=${encodeURIComponent(id)}&value=1`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.debug(`[Metrics] Increment error for "${counterName}":`, err.message);
    return null;
  }
}

export async function getCounterValue(counterName) {
  try {
    const id = sanitizeCounterId(counterName);
    const res = await fetch(`${COUNTER_BASE_URL}?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.value === 'number' ? data.value : 0;
  } catch (err) {
    console.debug(`[Metrics] Fetch error for "${counterName}":`, err.message);
    return 0;
  }
}
