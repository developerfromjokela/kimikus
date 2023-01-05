const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const SESSION_FILE_DIR = __dirname+'/config/';

const config = require('./config/config');
const client = new Client({ puppeteer: { headless: config.headless, ...config.puppeteer}, authStrategy: new LocalAuth({dataPath: SESSION_FILE_DIR})});

const dualLog = (...log) => {
    console.log(...log);
    config.adminGroups.forEach(i => {
        client.sendMessage(i, log.map(i => i.toString()).join("\n"));
    })
}

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


client.on('qr', (qr) => {
    console.clear();
    qrcode.generate(qr, function (qrcode) {
        console.log(qrcode);
    });
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
    throw new Error(msg)
});

let lastDeviceState = undefined;

client.on('ready', () => {
    dualLog(`*READY*\n${(new Date()).toLocaleString()}\n`);
    initModules();
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