// db.js
import pkg from 'pg';
import dotenv from 'dotenv';
const { Client } = pkg;

dotenv.config();
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT), // Default PostgreSQL port
};

// Create a new PostgreSQL client instance
const client = new Client(dbConfig);

// Connect to the database
client.connect();

export default client;
