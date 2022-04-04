const fs = require('fs');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });


const SESSION_FILE_PATH = './config/session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}
const config = require('./config/config');
const client = new Client({ puppeteer: { headless: config.headless }, session: sessionCfg });

const dualLog = (...log) => {
    console.log(...log);
    config.adminGroups.forEach(i => {
        client.sendMessage(i, log.map(i => i.toString()).join("\n"));
    })
}

//


const initModules = async () => {
    dualLog("Initializing modules...");
    for (let module of config.modules) {
        let success = false;
        let err = "UNKNOWN";
        try {
            await module.init(client, config[module.info.name])
            success = true;
        } catch (e) {
            err = e;
            console.error(e);
        }
        dualLog(`Module: ${module.info.name} v${module.info.version}:  ${success ? `✅ Success` : `❌ Failed: ${err.toString()}`}`);
    }
}

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });


client.on('qr', (qr) => {
    console.clear();
    qrcode.generate(qr, function (qrcode) {
        console.log(qrcode);
    });
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

let lastDeviceState = undefined;

client.on('ready', () => {
    dualLog(`*READY*\n${(new Date()).toLocaleString()}\n`);
    initModules();
});

client.on('change_battery', (batteryInfo) => {
    // Battery percentage for attached device has changed
    const { battery, plugged } = batteryInfo;
    console.log(`Battery: ${battery}% - Charging? ${plugged}`);
    if (lastDeviceState === undefined) {
        lastDeviceState = batteryInfo;
        return;
    }
    if (batteryInfo.plugged !== lastDeviceState.plugged) {
        config.adminGroups.forEach(i => {
            client.sendMessage(i, `*Varoitus!* Laite ${plugged === true ? 'liitettiin' : 'irrotettiin'} laturista! \nAkun varaus on ${batteryInfo.battery}`);
        })
        return;
    }
    if (batteryInfo.battery !== lastDeviceState.battery && batteryInfo.battery < 10) {
        config.adminGroups.forEach(i => {
            client.sendMessage(i, `!!! Akun varaus on ${batteryInfo.battery}, ja laturi ${plugged === true ? "on" : "ei ole"} kiinni`);
        })
    }
    lastDeviceState = batteryInfo;
});

client.on('message', async (msg) => {
    if (msg.fromMe)
        return;
    if (!msg.body)
        return;
    let chat = await msg.getChat();
    const author = msg.author || msg.from;
    console.log('MESSAGE RECEIVED', author, msg.body, msg.from);
    if (msg.body.startsWith('!admin') && config.adminGroups.includes(author)) {
        let command = msg.body.split(" ");
        if (command.length > 1) {
            let cmdName = command[1];
            if (cmdName === "listgroups") {
                let chats = (await client.getChats()).filter(i => {
                    return i.isGroup
                });
                chats.forEach(i => {
                    chat.sendMessage(i.id._serialized + ": " + i.name)
                });
            }
        }
    }
})

client.initialize();