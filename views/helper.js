const userLookUp = function (email, database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null
};
 

module.exports = userLookUp;