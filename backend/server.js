const WebSocket = require('ws');
const mysql = require('mysql2');

// Create MariaDB connection
const db = mysql.createConnection({
    host: '192.168.1.10', // Change to your database server's IP or hostname
    user: 'chatadmin',  // Replace with your MariaDB username
    password: 'admin123',  // Replace with your MariaDB password
    database: 'chat_app_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MariaDB');
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Fetch existing messages from the database
    db.query('SELECT username, message, timestamp FROM messages ORDER BY timestamp ASC', (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return;
        }
        results.forEach((row) => {
            ws.send(`[${row.timestamp}] ${row.username}: ${row.message}`);
        });
    });

    ws.on('message', (message) => {
        console.log('Received:', message);

        // Extract username and message (you can parse message as JSON if needed)
        const username = 'Anonymous'; // Placeholder, adjust according to your message format
        const sql = 'INSERT INTO messages (username, message) VALUES (?, ?)';

        db.query(sql, [username, message], (err) => {
            if (err) {
                console.error('Error inserting message:', err);
                return;
            }
            console.log('Message saved to database');
        });

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`[${new Date().toLocaleTimeString()}] ${username}: ${message}`);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
