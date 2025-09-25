const mysql = require('mysql2/promise');
require('dotenv').config();

// Parse l'URL de connexion Railway
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:psGoalyEZEiDcpWdzGaWEhILQvOCewlU@turntable.proxy.rlwy.net:16735/railway';

const url = new URL(DATABASE_URL);

const dbConfig = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace(/^\//, ''), // enlève le slash initial
  port: Number(url.port),
  charset: 'utf8mb4',
  timezone: '+00:00'
};

let pool;

const createConnection = async () => {
  try {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(' Connexion à MySQL établie avec Railway');
    return pool;
  } catch (error) {
    console.error(' Erreur de connexion à MySQL:', error);
    throw error;
  }
};

const getConnection = () => {
  if (!pool) {
    throw new Error('Base de données non initialisée');
  }
  return pool;
};

const testConnection = async () => {
  try {
    if (!pool) {
      await createConnection();
    }
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    return { success: true, message: 'Connexion à la base de données Railway réussie' };
  } catch (error) {
    console.error('Erreur de test de connexion:', error);
    throw error;
  }
};

module.exports = {
  createConnection,
  getConnection,
  testConnection,
  dbConfig
};
