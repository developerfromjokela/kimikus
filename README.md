# Kimikus
Multifunctional WhatsApp bot

Kimikus is built on modules, which can be disabled and enabled as needs arise and demands change.

### Requirements:
- Node 12 and NPM

### Built-in plugins
---

#### WebSocket server
On your defined port opens a websocket server using Basic Authentication.
By sending a JSON encoded message to server, you can send messages to a recipient.

Example message body:
```json
{
  "command": "send-message",
  "type": "plain",
  "message": "Hello world!",
  "recipient": "358444444444@c.us"
}
```

### Webhook HTTP server
Favorite way to interact with kimikus is via webhooks.
As defined in configuration, you need your webhook token and your recipient's ID, which is whitelisted for selected token.

Endpoint: `/webhook/token_here/recipient_id_here`
JSON Body:
```json
{
    "message": "Hello world!"
}
```

### Custom plugins
---
Kimikus supports custom plugins with purpose to extend its functionality.
You can add your custom modules by: 

1. Copying custom plugin example `modules/custom/custom-plugin.js.placeholder` to a JS-file, example: `myawesomeplugin.js`
2. Modifying plugin name and version to suit your needs
3. Writing necessary functionality and initializing it in init function.
4. Enabling module in config.js and defining its configuration object (NOTICE! Use module name as key for object!)


For WhatsApp Web client configuration, visit <a href="https://docs.wwebjs.dev/Client.html">https://docs.wwebjs.dev/Client.html</a>


### Setup
---
Install NPM requirements with `npm install`.

Rename `config.example` to `config` and configure bot using config.js file.

On first run, kimikus will print WhatsApp Web QR code in terminal. Alternatively by disabling headless mode, you can scan directly from browser. 
On servers, GUI may not be available, and terminal QR code must be used instead.

### Configuration file

- `modules`: Enabled modules as shown in example
- `headless`: Run chromium/chrome headless or not (true/false)
- `adminGroups`: "Define admin users or groups. WhatsApp User's ID should be put together according to this scheme: `<countrycode><num>@c.us`. Example: `358444444444@c.us` for number +358 44 444 4444. Once you get admin access, send kimikus direct message  (`!admin listgroups`) to get groups' IDs.

### Running under docker
---
Kimikus has included docker compose file and Dockerfile.

One may use Dockerfile by building the image and starting.
With docker-compose build and docker-compose up, you can get kimikus running with config volume mounted.
