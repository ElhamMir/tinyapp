//checks if the email address is already used
function getUserByEmail(email,usersDatabase) {
    const a = Object.values(usersDatabase);
  
    for(const user of a) {
      if(user.email === email) {
        return user.id;
      }
    }
    return null;
  }

  module.exports = {
    getUserByEmail
  }