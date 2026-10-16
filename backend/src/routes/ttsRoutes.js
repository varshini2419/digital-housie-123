const express = require('express');
const router = express.Router();

const memoryCache = new Map();

/**
 * GET /api/tts?text=...&lang=te|en
 * Proxies TTS audio from Google Translate TTS without client referer blocking,
 * with in-memory caching and proper audio/mpeg headers.
 */
router.get('/', async (req, res) => {
    try {
        const text = (req.query.text || '').trim();
        const lang = (req.query.lang || 'te').toLowerCase() === 'en' ? 'en' : 'te';

        if (!text) {
            return res.status(400).json({ error: 'Text parameter is required' });
        }

        const cacheKey = `${lang}:${text}`;
        if (memoryCache.has(cacheKey)) {
            const cachedBuffer = memoryCache.get(cacheKey);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(cachedBuffer);
        }

        const encoded = encodeURIComponent(text);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encoded}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch speech audio' });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Cache up to 300 entries in memory
        if (memoryCache.size < 300) {
            memoryCache.set(cacheKey, buffer);
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
    } catch (err) {
        console.error('TTS Proxy Error:', err);
        res.status(500).json({ error: 'Internal server error fetching TTS' });
    }
});

module.exports = router;
