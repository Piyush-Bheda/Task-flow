import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'taskflow',
  password: '123',
  port: 5432,
});
try {
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('Tables:', tables.rows.map(r => r.table_name));
  const count = await pool.query('SELECT COUNT(*) FROM issues');
  console.log('Issues count:', count.rows[0].count);
  const cols = await pool.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='issues' ORDER BY ordinal_position");
  console.log('Columns:', cols.rows.map(r => `${r.column_name}(${r.data_type})`));
} catch (e) {
  console.error(e);
} finally {
  await pool.end();
}
