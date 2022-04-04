module.exports = {
    modules: [
        require('../modules/websocket'),
        require('../modules/webhook'),
        // Define custom modules:
        // require('../modules/custom/<name>.js'),
    ],
    headless: true,
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