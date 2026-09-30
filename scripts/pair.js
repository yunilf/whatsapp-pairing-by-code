const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

const phoneNumber = process.argv[2];
const credsPath = process.argv[3];

if (!phoneNumber || !credsPath) {
    console.error('Uso: node pair.js <numero_telefono> <ruta_credenciales>');
    process.exit(1);
}

async function run() {
    const { state, saveCreds } = await useMultiFileAuthState(credsPath);
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    let requested = false;
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && !requested) {
             requested = true;
             console.log('Solicitando código a los servidores de WhatsApp para ' + phoneNumber + '...');
             setTimeout(async () => {
                 try {
                     const code = await sock.requestPairingCode(phoneNumber);
                     console.log('\n======================================');
                     console.log('CÓDIGO DE EMPAREJAMIENTO: ' + code);
                     console.log('======================================\n');
                 } catch (e) { console.error('Error al obtener el código:', e?.data || e?.message || e); }
             }, 1000);
        }
        
        if(connection === 'close') {
             requested = false;
             run();
        }
        
        if(connection === 'open') {
            console.log('\n======================================');
            console.log('CONEXIÓN EXITOSA. CREDENCIALES GUARDADAS EN: ' + credsPath);
            console.log('======================================\n');
            setTimeout(() => process.exit(0), 2000);
        }
    });
}
run();