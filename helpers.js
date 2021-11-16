//checks if the email address is already used
function getUserByEmail(email,usersDatabase) {
    //const a = Object.values(usersDatabase);
  
    for(const user in usersDatabase) {
      if(usersDatabase[user].email === email) {
        return user;
      }
    }
    return null;
  }

  module.exports = {
    getUserByEmail
  }