const express = require('express');
const bodyparser = require('body-parser');

const missingParams = {error: "Missing parameters"};
const error = (message) => {return {error: message}};

const init = async (whatsappInterface, config) => {
    const app = express();
    app.use(bodyparser.json())
    app.post('/webhook/:token/:recipient', async (req, res) => {
        if (!req.body.message) {
            res.status(400);
            res.json(missingParams);
            return;
        }
        if (!Object.keys(config.tokens).includes(req.params.token) || !config.tokens[req.params.token].includes(req.params.recipient)) {
            res.status(400);
            res.json(missingParams);
            return;
        }
        try {
            let msg = await whatsappInterface.sendMessage(req.params.recipient, req.body.message);
            delete msg['_data'];
            res.json({message: msg});
        } catch (e) {
            console.error(e);
            res.status(500);
            res.json(error(e.toString()))
        }
    })
    await new Promise((resolve, reject) => {
        app.on('error', reject);
        try {
            app.listen(config.port, resolve);
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    init, info: {name: 'webhook', version: 1.0}
}