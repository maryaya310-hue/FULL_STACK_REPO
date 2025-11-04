// app.js

// Importation des fonctions depuis les autres modules
const { ajouterContact, listerContacts } = require('./b');
const formaterContact = require('./utils/format');

// Ajout de quelques contacts
ajouterContact('Maryam', '123456789');
ajouterContact('Salma', '32987711345');
ajouterContact('Islam', '123456788');

// Affichage des contacts formatés
listerContacts().forEach(c => console.log(formaterContact(c)));
