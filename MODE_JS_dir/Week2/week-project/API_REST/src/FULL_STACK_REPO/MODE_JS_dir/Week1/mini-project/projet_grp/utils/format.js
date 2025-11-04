// utils/format.js

// Fonction pour formater un contact sous forme de texte lisible
function formaterContact(contact) {
    return `${contact.nom} - ${contact.telephone}`;
}

// Export de la fonction unique
module.exports = formaterContact;
