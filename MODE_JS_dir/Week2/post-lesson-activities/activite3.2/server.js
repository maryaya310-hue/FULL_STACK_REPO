// On importe le module 'fs' (file system) mais uniquement la version avec Promises pour pouvoir utiliser async/await
const fs = require('fs').promises;

// On importe le module 'path' pour gérer les chemins de fichiers de manière portable
const path = require('path');

// On construit le chemin absolu vers le fichier JSON contenant les produits
const dataPath = path.join(__dirname, '../data/products.json');

// On exporte une fonction asynchrone qui renvoie les produits filtrés selon des critères passés en argument
exports.getFilteredProducts = async (filters) => {
  try {
    // On lit le fichier JSON de façon asynchrone et on récupère son contenu sous forme de chaîne de caractères
    const data = await fs.readFile(dataPath, 'utf8');

    // On convertit la chaîne JSON en objet JavaScript (ici un tableau de produits)
    let products = JSON.parse(data);

    // --- FILTRAGE DES PRODUITS ---
    // Si un filtre 'category' est fourni, on ne garde que les produits correspondant à cette catégorie
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }

    // Si un filtre 'minPrice' est fourni, on ne garde que les produits dont le prix est supérieur ou égal à minPrice
    if (filters.minPrice) {
      products = products.filter(p => p.price >= parseFloat(filters.minPrice));
    }

    // Si un filtre 'maxPrice' est fourni, on ne garde que les produits dont le prix est inférieur ou égal à maxPrice
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    // --- TRI DES PRODUITS ---
    // Si le filtre 'sort' est 'asc', on trie les produits par prix croissant
    if (filters.sort === 'asc') {
      products.sort((a, b) => a.price - b.price);
    // Si le filtre 'sort' est 'desc', on trie les produits par prix décroissant
    } else if (filters.sort === 'desc') {
      products.sort((a, b) => b.price - a.price);
    }

    // On affiche dans la console le nombre de produits après filtrage
    console.log(`Requête filtrée : ${products.length} résultats trouvés`);

    // On retourne le tableau de produits filtrés et triés
    return products;
  } catch (err) {
    // Si une erreur survient lors de la lecture du fichier, on lance une nouvelle erreur
    throw new Error('Erreur lors de la lecture des données');
  }
};
// Note : Cette fonction peut être utilisée dans un serveur Express pour répondre aux requêtes API avec des produits filtrés selon les critères spécifiés dans les paramètres de la requête.