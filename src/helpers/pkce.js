const crypto = require('crypto');
const { safeRedisCall } = require('./redis');
const log = require('./logger');

const PKCE_TTL_SECONDS = 600; // a sign-in must be completed within 10 minutes
const memoryStore = new Map(); // fallback when Redis is unavailable

const base64Url = (buffer) => buffer.toString('base64url');

// 32 random bytes -> 43 chars of base64url (valid verifier: 43-128 chars of [A-Za-z0-9-._~])
const generateCodeVerifier = () => base64Url(crypto.randomBytes(32));

const generateCodeChallenge = (verifier) =>
    base64Url(crypto.createHash('sha256').update(verifier).digest());

const generateState = () => base64Url(crypto.randomBytes(16));

const sweepMemoryStore = () => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
        if (entry.expiresAt <= now) memoryStore.delete(key);
    }
};

const storeVerifier = async (state, verifier) => {
    const key = `trakt:pkce:${state}`;
    const result = await safeRedisCall('set', key, verifier, { EX: PKCE_TTL_SECONDS });
    if (result === null) {
        // Redis unavailable: keep it in memory instead
        sweepMemoryStore();
        memoryStore.set(state, { verifier, expiresAt: Date.now() + PKCE_TTL_SECONDS * 1000 });
        log.debug('Stored PKCE verifier in memory (Redis unavailable).');
    }
};

// One-time use: the verifier is removed as soon as it is read.
const consumeVerifier = async (state) => {
    if (!state) return null;

    const key = `trakt:pkce:${state}`;
    const fromRedis = await safeRedisCall('getDel', key);
    if (fromRedis) return fromRedis;

    const entry = memoryStore.get(state);
    memoryStore.delete(state);
    if (entry && entry.expiresAt > Date.now()) return entry.verifier;

    return null;
};

module.exports = {
    generateCodeVerifier,
    generateCodeChallenge,
    generateState,
    storeVerifier,
    consumeVerifier,
};
