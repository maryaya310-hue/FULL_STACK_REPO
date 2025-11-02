// logger.js — Module de journalisation avec événements

const fs = require('fs');               // Pour la manipulation de fichiers
const EventEmitter = require('events'); // Pour la gestion des événements

// Classe personnalisée Logger
class Logger extends EventEmitter {
  constructor(logFile = 'log.txt') {
    super(); // Appel du constructeur de EventEmitter
    this.logFile = logFile; // Définit le fichier de log à utiliser
  }

  // Méthode principale pour enregistrer un message
  log(message) {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    const entry = `[${timestamp}] ${message}\n`;

    // Écriture asynchrone dans le fichier log
    fs.appendFile(this.logFile, entry, (err) => {
      if (err) console.error('Erreur d’écriture du log :', err);
    });

    // Déclenche un événement après l’écriture
    this.emit('messageLogged', entry);
  }

  // Méthode spéciale pour signaler une mémoire faible
  warnLowMemory(percentFree) {
    const message = `⚠️ Mémoire faible : ${percentFree.toFixed(2)}% libre`;
    this.log(message);
    this.emit('lowMemory', message);
  }
}

module.exports = Logger;
