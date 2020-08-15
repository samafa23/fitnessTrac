const express = require('express');
const routinesRouter = express.Router();
const { getPublicRoutines } = require('../db');
const { requireUser } = require('./utils');

routinesRouter.get('/', async (req, res) => {
    try {
        const publicRoutines = await getPublicRoutines();

        res.send({
            publicRoutines
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

// routinesRouter.post('/', requireUser, async (req, res) => {

// });

module.exports = routinesRouter;