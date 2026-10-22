const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'taskflow',
  password: '123',
  port: 5432,
});
(async () => {
  try {
    const issues = await pool.query('SELECT * FROM issues');
    console.log('Issues:', JSON.stringify(issues.rows, null, 2));
    const users = await pool.query('SELECT id, name, email FROM users');
    console.log('Users:', JSON.stringify(users.rows, null, 2));
    const projects = await pool.query('SELECT id, name FROM projects');
    console.log('Projects:', JSON.stringify(projects.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
