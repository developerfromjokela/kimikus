module.exports = {
    modules: [
        require('../modules/websocket'),
        require('../modules/webhook'),
        // Define custom modules:
        // require('../modules/custom/<name>.js'),
    ],
    headless: true,
    puppeteer: {
        // Options for puppeteer
        /* These settings are required to get puppeteer working inside docker
        "bindAddress": "0.0.0.0",
        "args": [
            "--headless",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--remote-debugging-port=9222",
            "--remote-debugging-address=0.0.0.0",
            "--no-sandbox"
        ]*/
    },
    adminGroups: ["<chat_id>@c.us"],
    websocket: {
        port: 8081,
        username: "username",
        password: "password"
    },
    webhook: {
        port: 8082,
        tokens: {
            "<token>": ["<accepted_recipient_id>"]
        }
    }
    // Define module configurations here:
    /*
    "custom-module": {
       config: "value"
    },
     */
}