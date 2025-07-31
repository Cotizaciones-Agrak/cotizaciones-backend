const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const AsyncLock = require('async-lock');

const app = express();
const port = process.env.PORT || 3000;

// Permitir CORS a todo
app.use(cors());

const data = require("./src/data.json");
const db = require("./src/" + data.database);
const lock = new AsyncLock();

// Obtener el número de folio
app.get('/get_next_id', async (req, res) => {
  try {
    // Adquirir un lock compartido
    await lock.acquire('folioLock', async () => {
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

// app.get('/createTable', async (req, res) => {
//   // Obtener el número actual de la base de datos
//   const ret_log = await db.createTable();
//   res.json({devuelto: ret_log});
// });

// app.get('/error', async (req, res) => {
//   // Obtener el número actual de la base de datos
//   const Folio = undefined;
//   if (!Folio){
//     res.status(400).send('No hay folio');
//   } else {
//     res.status(200).send('Estuvo bien');
//   }
// });

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
