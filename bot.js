const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2');

// Koneksi ke database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Sesuaikan dengan username database Anda
    password: '', // Sesuaikan dengan password database Anda
    database: 'wabotri' // Nama database
});

// Inisialisasi client WhatsApp dengan autentikasi lokal
const client = new Client({
    authStrategy: new LocalAuth(), // Ini menyimpan sesi secara lokal
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

function insertMessageToDB(number, time, message, type_message) {
    const query = 'INSERT INTO message (number, time, message, type_message) VALUES (?, ?, ?, ?)';
    db.execute(query, [number, time, message, type_message], (err, results) => {
        if (err) {
            console.log("Pesan Gagal");
            console.error('Error inserting message into database:', err);
        } else {
            console.log("Pesan Masuk");
        }
    });
}

client.on('message', async (message) => {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format waktu sekarang

    if (!message.from.includes('@g.us')) { // Jika bukan dari grup
        console.log(`Personal message from ${message.from}: ${message.body}`);
        const contact = await message.getContact();
        const contactName = contact.pushname || "Tanpa Nama";

        insertMessageToDB(message.from, currentTime, message.body, 'personal', contactName);
    } else {
        console.log(`Message from group ${message.from}: ${message.body}`);
        insertMessageToDB(message.from, currentTime, message.body, 'group', "Tanpa Nama");
    }
});

client.initialize();
