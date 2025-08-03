// src/postgres.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Requerido por Render
});

// Inicializar tabla si no existe
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cotizaciones (
        id SERIAL PRIMARY KEY,
        numero INTEGER
      )
    `);

    const result = await pool.query('SELECT COUNT(*) FROM cotizaciones');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query('INSERT INTO cotizaciones (numero) VALUES ($1)', [1]);
    }

    console.log("✅ Base de datos PostgreSQL lista");
  } catch (err) {
    console.error("❌ Error al inicializar la base de datos:", err);
  }
})();

module.exports = {
  async getFolio() {
    const result = await pool.query('SELECT numero FROM cotizaciones LIMIT 1');
    return result.rows[0]?.numero;
  },

  async incrementFolio() {
    await pool.query('UPDATE cotizaciones SET numero = numero + 1 WHERE id = 1');
  },

  async resetFolio() {
    await pool.query('UPDATE cotizaciones SET numero = 1 WHERE id = 1');
  },

  async setFolio(numero) {
    await pool.query('UPDATE cotizaciones SET numero = $1 WHERE id = 1', [numero]);
  }
};
