const {WebSocketServer} = require("ws");

var express = require('express');
var wsBasicAuth = require("ws-basic-auth-express");
var http = require('http');

const unknownCommand = JSON.stringify({error: "Unknown command"});
const missingParams = JSON.stringify({error: "Missing parameters"});
const error = (message) => JSON.stringify({error: message});

const sendWhatsappMessage = async (whatsapp_client, client, data) => {
    if (!data.recipient || !data.message || !data.type) {
        client.send(missingParams);
        return;
    }
    if (data.type !== "plain") {
        client.send(error("Invalid message type!"));
        return;
    }
    try {
        let message = await whatsapp_client.sendMessage(data.recipient, data.message.toString());
        client.send(JSON.stringify({message}));
    } catch (e) {
        console.error(e);
        client.send(error(e.toString()));
    }
}

const init = async (whatsappInterface, config) => {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({server});

    const wsAuth = wsBasicAuth(function(username, password) {
        return username === config.username && password === config.password;
    });

    wss.on('connection', (client) => {
        client.send(JSON.stringify({connect: true, serverVersion: module.exports.info.version}));
        client.on('message', function message(data) {
            console.log('received: %s', data);
            try {
                let jsonData = JSON.parse(data);
                console.log(jsonData);
                if (jsonData.command) {
                    switch (jsonData.command) {
                        case "send-message":
                            sendWhatsappMessage(whatsappInterface, client, jsonData);
                            break;
                    }
                } else {
                    client.send(unknownCommand)
                }
            } catch (e) {}
        });
    })


    server.on('upgrade', wsAuth);
    await new Promise((resolve, reject) => {
        server.on('error', reject);
        try {
            server.listen(config.port, resolve);
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    init, info: {name: 'websocket', version: 1.0}
}