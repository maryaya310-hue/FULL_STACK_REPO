// server.js — Serveur HTTP pour afficher les logs

const http = require('http');
const fs = require('fs');
const os = require('os');

const PORT = 3000; // Port du serveur HTTP

const server = http.createServer((req, res) => {
  // Page d’accueil
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bienvenue sur le Node System Logger 👋\n\nRoutes disponibles:\n/logs → afficher les logs\n/stats → voir les stats système');
  }

  // Affichage du contenu du log
  else if (req.url === '/logs') {
    fs.readFile('log.txt', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Erreur lecture du fichier log.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(data);
    });
  }

  // Route /stats → affiche les stats système en JSON
  else if (req.url === '/stats') {
    const stats = {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      freePercent: ((os.freemem() / os.totalmem()) * 100).toFixed(2)
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats, null, 2));
  }

  // Erreur 404 pour les routes inconnues
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erreur 404 : Page non trouvée.');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
