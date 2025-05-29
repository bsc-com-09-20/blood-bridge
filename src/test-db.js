const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: 'sql5.freesqldatabase.com',
      port: 3306,
      user: 'sql5780528',
      password: 'D2R1MvtM5r',
      database: 'sql5780528',
      connectTimeout: 60000,
    });

    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
  }
}

testConnection();