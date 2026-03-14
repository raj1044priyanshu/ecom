import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 min default TTL

export const getCache = (key) => cache.get(key);

export const setCache = (key, value, ttl = 600) => cache.set(key, value, ttl);

export const deleteCache = (key) => cache.del(key);

export const flushCache = () => cache.flushAll();

export default cache;
