// FUNCTIONS USED BY TINYAPP

const bcrypt = require('bcrypt');

//function to return a 6 char long random string.
const generateRandomString = () => {
  let charSet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += charSet[Math.floor(Math.random() * charSet.length)];
  }
  return id;
}

//function to check if email already exists in database and send back true or false.
const userExists = (userEmail, database) => {
  for (let id in database) {
    if (database[id].email === userEmail) {
      return true;
    }
  }
  return false;
}

//function to check if entered password matches with one in database. Returns true or false.
const passwordMatches = (userEmail, userPassword, database) => {
  for (let id in database) {
    if (database[id].email === userEmail && bcrypt.compareSync(userPassword, database[id].password)) {
      return true;
    }
  }
  return false;
}

//function to return id from users database for a given email.
const findID = (userEmail, database) => {
  for (let id in database) {
    if (database[id].email === userEmail) {
      return database[id].id;
    }
  }
  return false;
}

//function to return a filtered version of the URLs DB when given a user ID.
const filterURLDB = (userID, database) => {
  let filteredURLDB = {};
  for (let url in database) {
    if (database[url].userID === userID) {
      filteredURLDB[url] = database[url];
    }
  }
  return filteredURLDB;
}

module.exports = {
  generateRandomString,
  userExists,
  passwordMatches,
  findID,
  filterURLDB
};