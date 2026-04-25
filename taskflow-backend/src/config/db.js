const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the connection immediately when the server starts
pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        if (err.code === '28P01') {
            console.error('-> Make sure your database password is correct!');
        } else if (err.code === '3D000') {
            console.error('-> Make sure the "taskflow" database exists!');
        }
    } else {
        console.log('✓ Successfully connected to PostgreSQL database!');
        release(); // Release the client back to the pool
    }
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
