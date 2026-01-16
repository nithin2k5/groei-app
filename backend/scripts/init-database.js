const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error('\n❌ ERROR: .env file not found!');
  console.error(`Expected location: ${envPath}`);
  console.error('\nPlease create a .env file with the following variables:');
  console.error('DB_HOST=localhost');
  console.error('DB_USER=root');
  console.error('DB_PASSWORD=your_mysql_password');
  console.error('DB_NAME=hackforge_db\n');
  process.exit(1);
}

dotenv.config({ path: envPath });

async function initDatabase() {
  let connection;

  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    };

    if (!process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
      console.warn('\n⚠️  WARNING: DB_PASSWORD not set in .env file');
      console.warn('Attempting connection without password...\n');
    }

    console.log(`Connecting to MySQL at ${dbConfig.host} as ${dbConfig.user}...`);
    
    connection = await mysql.createConnection(dbConfig);

    console.log('Connected to MySQL server');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement + ';');
          console.log('Executed statement successfully');
        } catch (error) {
          if (error.code !== 'ER_TABLE_EXISTS_ERROR' && error.code !== 'ER_DB_CREATE_EXISTS') {
            console.error('Error executing statement:', error.message);
            console.error('Statement:', statement.substring(0, 100));
          }
        }
      }
    }

    console.log('\n✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('\n❌ Database initialization error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔐 Authentication failed. Possible issues:');
      console.error('1. Check if DB_PASSWORD in .env file is correct');
      console.error('2. Verify MySQL root password');
      console.error('3. Ensure MySQL server is running');
      console.error('\nIf MySQL root has no password, set in .env:');
      console.error('DB_PASSWORD=\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused. Make sure MySQL server is running.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();


