// On importe le service de gestion des données (ici pour récupérer les produits filtrés)
const dataService = require('../services/dataService');

// On définit une route GET pour '/products' sur le router
// La fonction est asynchrone car elle va appeler une fonction async (dataService.getFilteredProducts)
router.get('/products', async (req, res, next) => {
  try {
    // On récupère les filtres envoyés en query string dans l'URL (ex: /products?category=books&minPrice=10)
    const filters = req.query;

    // On appelle la fonction asynchrone pour obtenir les produits filtrés selon les critères fournis
    const products = await dataService.getFilteredProducts(filters);

    // On renvoie le tableau de produits en JSON dans la réponse HTTP
    res.json(products);

  } catch (err) {
    // En cas d'erreur, on passe l'erreur au middleware de gestion des erreurs d'Express
    next(err);
  }
});
