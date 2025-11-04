const express = require('express');
const app = express();

// Route: list of products
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Laptop' },
    { id: 2, name: 'Phone' }
  ]);
});

// Route: single product by ID
app.get('/api/products/:id', (req, res) => {
  res.json({ message: `Produit ${req.params.id}` });
});

// Start the server
app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
