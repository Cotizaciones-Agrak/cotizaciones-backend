require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AsyncLock = require('async-lock');

const app = express();
const port = process.env.PORT || 3000;

// Permitir CORS a todo
app.use(cors());

const db = require('./src/postgres.js');
const lock = new AsyncLock();

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// Obtener el número de folio
app.get('/get_next_id', async (req, res) => {
  try {
    // Adquirir un lock compartido
    await lock.acquire('folioLock', async () => {
      // await delay(5000);
      // Obtener el número actual de la base de datos
      const Folio = await db.getFolio();
      // Incrementar el folio en la base de datos
      await db.incrementFolio();

      if (!Folio) {
        res.status(500).send('No hay folio');
      } else {
        res.json({ id: Folio });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/resetFolio', async (req, res) => {
  // Obtener el número actual de la base de datos
  await db.resetFolio();
  res.json({status: "Reseteado"});
});

// Nuevo endpoint para setear un folio específico
app.get('/set_folio/:numero', async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    if (isNaN(numero) || numero < 1) {
      return res.status(400).send("Número de folio inválido");
    }

    await db.setFolio(numero);
    res.json({ status: "Folio actualizado", folio: numero });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al establecer el folio");
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
