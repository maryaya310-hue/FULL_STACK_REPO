module.exports = (err, req, res, next) => {
  // if no error provided, treat as generic 500
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : "Erreur serveur";
  // log server errors
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
};
