/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");

let db;

// 📌 Determinar ruta de la base de datos
// En producción (Render, Railway, etc.) se usará /tmp que sí es escribible
const isProduction = process.env.NODE_ENV === "production";
const dbDir = isProduction ? "/tmp" : path.join(__dirname, "..", ".data");

// Crear carpeta si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbFile = path.join(dbDir, "choices.db");
const exists = fs.existsSync(dbFile);

console.log(`📦 Usando base de datos en: ${dbFile}`);
/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    // We use try and catch blocks throughout to handle any database errors
    try {
      // The async / await syntax lets us write the db operations in a way that won't block the app
      if (!exists) {
        
        await db.run(
          "CREATE TABLE Cotizaciones (id INTEGER PRIMARY KEY AUTOINCREMENT, numero INTEGER)"
        );
        await db.run(
          "INSERT INTO Cotizaciones (id, numero) VALUES (0, 1)"
        );
        
      }
      
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Our server script will call these methods to connect to the db
module.exports = {
  
  getFolio: async()  => {
    // We use a try catch block in case of db errors
    try {
      const option = await db.all("SELECT * from Cotizaciones WHERE id = 0");
      const folio = option[0].numero;
      return folio;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  incrementFolio: async() => {
    // We use a try catch block in case of db errors
    try {
      await db.run("UPDATE Cotizaciones SET numero = numero + 1 WHERE id = 0");
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  resetFolio: async() => {
    // We use a try catch block in case of db errors
    try {
      await db.run("UPDATE Cotizaciones SET numero = 1 WHERE id = 0");
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // errorXD: async() => {
  //   try {
  //     const option = await db.all("SELECT * from Co WHERE id = 0");
  //     const folio = option[0].numero;
  //     return folio;
  //   } catch (dbError) {
  //     // Database connection error
  //     console.error(dbError);
  //   }
  // },
  //
  // createTable: async() => {
  //   try {
  //     await db.run("CREATE TABLE Cotizaciones (id INTEGER PRIMARY KEY AUTOINCREMENT, numero INTEGER)");
  //     await db.run("INSERT INTO Cotizaciones (id, numero) VALUES (0, 1)");
  //     return 'success'
  //   } catch (dbError) {
  //     // Database connection error
  //     console.error(dbError);
  //   }
  // }
};
