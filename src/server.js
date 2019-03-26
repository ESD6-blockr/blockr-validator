require('dotenv').config();

const Validator = require('./lib/validator').getInstance();
const Messager = require('./util/messager');
const QrCodeGenerator = require('./services/qrCodeGenerator');
const Peer = require('./lib/p2p/peer');
//const opn = require('opn');
const express = require('express');
const http = require('http');
const Security = require('./lib/security/security').getInstance();
const KeyStorage = require('./lib/util/keyStorage');
const TransactionBuilder = require('./lib/util/transactionBuilder').getInstance();
const qrCodeGenerator = new QrCodeGenerator();
const sleep = require('sleep');
let io = require('socket.io');
const Sentry = require('@sentry/node');

let sender;
let node;
let messager;
const connected = false;

// Initialize app with Express
const app = express();
app.use(express.static(`${__dirname}/public`));

// Setup exception logging
const applicationMode = process.env.ENVIRONMENT;
if (applicationMode === 'production' || applicationMode === 'staging') {
    Sentry.init({
        dsn: 'https://8ae89827146d49309d5a8e5699a605b6@sentry.io/1419602',
        environment: applicationMode
    });
}

// Redirect default '/' call to main.htm page
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

console.log("Start waiting....");
if (process.env.IS_BACKUP === "true") {
    sleep.sleep(10);
} else {
    sleep.sleep(15);
}
console.log("Stop waiting....");

// Start listening with HTTP (picks random available port)
const server = http.createServer(app).listen(8000);
// Open default browser after server creation
// opn(`http://localhost:${server.address().port}`, (err) => {
//     console.log(err);
// });

// Start listening with WebSockets
io = io.listen(server);

io.on('connection', (socket) => {
    // Initialize logger for real-time webpage logging
    if (!connected) {
        messager = new Messager(socket);
    }

    socket.on('broadcast-message', (data) => {
        if (sender) {
            // For testing purposes
            sender.broadcastTransaction(JSON.parse(data.toString('utf8')).message);
        }
    });

    socket.on('send-transaction', (transaction) => {
        new KeyStorage().checkOrGenerateKeypair().then(() => {
            const peer = new Peer();
            TransactionBuilder.buildAsync(transaction.publickey, transaction.amount).then((transactionsigned) => {
                peer.broadcastMessage('transaction', transactionsigned);
            });
        });
    });

    socket.on('broadcast-chatmessage', (data) => {
        if (sender) {
            const { message } = JSON.parse(data.toString('utf8'));
            const sendername = node.id;
            const broadcastMessage = { message, sender: sendername };
            sender.broadcastMessage(broadcastMessage);
        }
    });

    socket.on('generate-keypair', () => {
        const mnemonic = Security.generateMnemonic();
        Security.generateKeyPair(mnemonic).then((result) => {
            messager.notify('keypair', {
                pubkey: result.pubKey,
                privkey: result.privKey,
            });
        });
    });

    socket.on('set-wallet', (keypair) => {
        console.log(keypair);
        messager.notify('wallet-set', keypair);
    });

    socket.on('generate-transaction-data', () => {
        messager.notify('transaction-generated', JSON.stringify({
            transaction: 'transaction',
        }));
    });

    socket.on('publish-transaction', () => {
        messager.notify('transaction-published', JSON.stringify({
            transaction: 'transaction',
        }));
    });

    socket.on('generate-qr-code-request', (data) => {
        qrCodeGenerator.generateQrCodeAsync(data).then((url) => {
            messager.notify('generate-qr-code-reply', url);
        }).catch((err) => {
            throw err;
        });
    });
});
