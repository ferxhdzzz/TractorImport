// Cargar variables de entorno PRIMERO
import 'dotenv/config';

// importo el archivo app.js
import app from "./app.js";
import "./database.js";

// Creo una función
// que se encarga de ejecutar el servidor
async function main() {
  const port = process.env.PORT || 4000;
  const host = '0.0.0.0'; // Escuchar en todas las interfaces de red
  
  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log(`Accesible desde otras máquinas en la red local usando tu IP local`);
  });
}
//Ejecutamos todo
main();