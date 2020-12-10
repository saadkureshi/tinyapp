const { assert } = require('chai');
const bcrypt = require('bcrypt');

const { generateRandomString, userExists, passwordMatches, findID, filterURLDB } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const testURLDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "shwi43" },
  sgq3y6: { longURL: "https://www.reddit.com", userID: "userRandomID" }
};

describe('#findID', function() {

  it('should return the user id for an existing user email', function() {
    const user = findID("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });

  it('should return false for a non-existent email', function() {
    const user = findID("bla@bla.com", testUsers);
    assert.isFalse(user);
  });

});

describe('#userExists', function() {

  it('should return true if email already exists in database', function() {
    const user = userExists("user@example.com", testUsers);
    assert.isTrue(user);
  });

  it('should return false for a non-existent email', function() {
    const user = findID("bla@bla.com", testUsers);
    assert.isFalse(user);
  });

});

describe('#passwordMatches', function() {

  it('should return true if entered password matches the one in the database', function() {
    const output = passwordMatches("user@example.com", "purple-monkey-dinosaur", testUsers);
    assert.isTrue(output);
  });

  it('should return false if entered password does not match the one in the database', function() {
    const output = passwordMatches("user@example.com", "wrong-password", testUsers);
    assert.isFalse(output);
  });

});

describe('#filterURLDB', function() {

  it('should return a filtered object containing specific user data', function() {
    const output = filterURLDB("userRandomID", testURLDatabase);
    const expectedOutput = {
      sgq3y6: { longURL: "https://www.reddit.com", userID: "userRandomID" }
    };
    assert.deepEqual(output, expectedOutput);
  });

  it('should return empty object if no userid match found', function() {
    const output = filterURLDB("non-existent-id", testURLDatabase);
    const expectedOutput = {};
    assert.deepEqual(output, expectedOutput);
  });

});

describe('#generateRandomString', function() {

  it('should generate a string', function() {
    const id = generateRandomString();
    assert.isString(id);
  });

  it('should be 6 characters long', function() {
    const id = generateRandomString();
    assert.lengthOf(id, 6);
  });

});