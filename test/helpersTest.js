const { assert } = require('chai');

const { getUserByEmail } = require('../helpers');

const { getURLByID } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  ism5xK: { longURL: "http://www.google.com", userID: "aJ48lW" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.deepEqual(user.id, expectedOutput);
  });

  it('should return undefined with non existant email', function() {
    const user = getUserByEmail("notexist@example.com", testUsers)
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});


describe('getURLByID', function() {
  it('should return shortURL object from database containing a match with id from user', function() {
    const urlObj = getURLByID("userRandomID", testUrlDatabase)
    const expectedOutput = {b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }}
    assert.deepEqual(urlObj, expectedOutput);
  });

  it('should return an empty object if not a match with id from user', function() {
    const urlObj = getURLByID("notexistID", testUrlDatabase)
    const expectedOutput = {};
    assert.deepEqual(urlObj, expectedOutput);
  });

});