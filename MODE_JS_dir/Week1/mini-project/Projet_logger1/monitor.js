// monitor.js — Surveillance du système

const os = require('os');           // Module pour accéder aux infos système
const Logger = require('./logger'); // Import du module Logger

const logger = new Logger();        // Création d’une instance du logger

// Fonction de surveillance principale
function monitorSystem() {
  const totalMem = os.totalmem(); // Mémoire totale du système (octets)
  const freeMem = os.freemem();   // Mémoire libre (octets)
  const uptime = os.uptime();     // Durée depuis le démarrage (secondes)
  const percentFree = (freeMem / totalMem) * 100; // Pourcentage mémoire libre

  // Création d’un message formaté pour le log
  const stats = `Mémoire libre : ${(freeMem / 1e6).toFixed(2)} MB / ${(totalMem / 1e6).toFixed(2)} MB | Uptime : ${uptime.toFixed(0)}s | Libre : ${percentFree.toFixed(2)}%`;

  // Écrit les statistiques dans le fichier log
  logger.log(stats);

  // Si la mémoire libre < 20%, émet un événement d’alerte
  if (percentFree < 20) {
    logger.warnLowMemory(percentFree);
  }
}

// Écoute les événements du logger
logger.on('messageLogged', () => console.log('→ Nouveau log enregistré'));
logger.on('lowMemory', (msg) => console.warn(msg));

// Exécution toutes les 5 secondes
console.log('Surveillance du système en cours...');
monitorSystem();
setInterval(monitorSystem, 5000);
