const express = require('express');
const log = require('../helpers/logger');
const catalogRoutes = require('./catalog');
const configureRoutes = require('./configure');
const manifestRoutes = require('./manifest');
const posterRoutes = require('./poster');
const traktRoutes = require('./trakt');

const router = express.Router();

const isBase64 = (str) => {
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!str || str.length % 4 !== 0 || !base64Regex.test(str)) {
        return false;
    }
    try {
        Buffer.from(str, 'base64').toString('utf8');
        return true;
    } catch (err) {
        return false;
    }
};

const IGNORE_PATHS = ['/catalog', '/list', '/configure', '/manifest', '/poster'];

const decodeBase64Middleware = (req, res, next) => {
    if (req.path.startsWith('/callback') || req.path.startsWith('/lists') || req.path.startsWith('/auth/')) {
        return next();
    }

    try {
        const pathParts = req.path.split('/');

        const decodedParts = pathParts.map(part => {
            if (IGNORE_PATHS.includes(`/${part}`)) {
                return part;
            }
            if (isBase64(part)) {
                try {
                    return Buffer.from(part, 'base64').toString('utf8');
                } catch (e) {
                    log.error(`Error decoding part: ${e.message}`);
                    return part;
                }
            } else {
                return part;
            }
        });

        req.url = decodedParts.join('/');

        log.info(`URL after Base64 decoding: ${req.url}`);

        next();
    } catch (error) {
        log.error('Base64 decoding error:', error);
        res.status(400).send('Bad request: Invalid Base64 encoding.');
    }
};

router.use(decodeBase64Middleware);

router.use((req, res, next) => {
    log.info(`--- Request received ---`);
    log.info(`${req.method} ${req.originalUrl}`);
    next();
});

router.use(catalogRoutes);
router.use(configureRoutes);
router.use(manifestRoutes);
router.use(posterRoutes);
router.use(traktRoutes);

router.use((err, req, res, next) => {
    const errorTime = new Date().toISOString();
    log.error(`${errorTime} - Error: ${err.stack}`);

    res.status(500).send(`Something broke! If you need help, please provide this timestamp to the developer : ${errorTime}`);
});

module.exports = router;
