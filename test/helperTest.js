const { assert } = require('chai');

const helper = require('../views/helper');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = helper("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
  });

  it('should return false if user does not exist', function() {
    const user = helper("abc@gmail.com", testUsers)
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID)
  });
});