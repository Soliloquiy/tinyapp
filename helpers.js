function getUserByEmail(email, database) {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
}

function getURLByID(id, database) {
  let obj = {};
  for (let key in database) {
    if (id === database[key].userID) {
      obj[key] = database[key];
    }
  }
  return obj;
}

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

module.exports = { getUserByEmail, getURLByID, generateRandomString };