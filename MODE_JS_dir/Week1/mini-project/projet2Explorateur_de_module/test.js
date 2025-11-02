// test.js
console.log(__filename);
console.log(__dirname);
console.log(module);
console.log(exports === module.exports);

exports.direSalut = () => console.log("Salut !");
