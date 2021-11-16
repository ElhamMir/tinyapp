const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs")
const bcrypt = require('bcrypt');
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


const users = { 
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
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log(req.cookies)
  const username = req.cookies.user_id;
  const email = req.cookies.email
  
  const templateVars = { 
    urls: urlsForUser(username,urlDatabase) ,
    username,
    user: users[username],
    email
   
  };
  console.log(users[username],username)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.user_id;
  if(!username) {
    return res.redirect("/login");
  }
  const templateVars = { 
    username
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies.user_id;
  const shortURL= req.params.shortURL;
  if(!userId) {
    console.log("user is invalid")
    res.status(400).send("You do not have permission to visit this page")
    
  } else {
    console.log("here",urlDatabase)
    const userurl = urlDatabase[shortURL].longURL && urlDatabase[shortURL].userID === userId
   // if (!userurl) {
   //   res.status(400).send("URL does not belong to the user")
    //}
  const templateVars = { 
    shortURL,
    longURL:urlDatabase[shortURL].longURL,
    username: req.cookies.user_id
  };
  res.render("urls_show", templateVars);}
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
 // const email = req.cookies.email 
 const userId = req.cookies.user_id;
 // const shortURL= req.params.shortURL;
  if(!userId) {
    console.log("user is invalid")
    res.redirect("/login"); 
    
  } 
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId
      }
  //urlDatabase[j] = req.body
  console.log(req.body,"req")
  //res.send("The URL has been added succesfully");   
  res.redirect("/urls");      // Respond with 'Ok' (we will replace this)
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.body.shortURL);
  delete urlDatabase[req.params.shortURL].longURL;
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const saved = req.params.shortURL
  // console.log(res);
  // console.log(req)
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  console.log(req.body.longURL)
  //urlDatabase[req.params.shortURL] = res.params ;
  res.redirect("/urls");
})

app.get("/login", (req, res) => {
  const username = req.cookies["user"];
  if(username) {
    return res.redirect("/urls");
  }
  const templateVars = {
    username: null
  }
  
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  //const userEmail = req.body.email; 
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,users)
  //const username = req.cookies["user"];

  if(!user || !bcrypt.compareSync(password,user.password)) {
    return res.status(401).send("Invalid Username or Password");
  }
  //else if (user && bcrypt.compareSync(password,user.password)){
    res.cookie('user_id',user.id)
    console.log(req.body)
    res.redirect("/urls");
  //}
  //const username = req.body.login
 
})

app.post("/logout", (req, res) => {
  const email = req.cookies.email
  
  res.clearCookie('user_id')
  res.clearCookie('email')
  res.redirect("/login");
})

app.get("/register", (req, res) => {
  const templateVars = {
    username: null
  }
  res.render("register",templateVars)
})

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if(!userEmail || !userPass){
    return res.send("Email or password is missing.")
  }
 if(getUserByEmail(userEmail,users)){
    return res.status(401).send("A user with this email already exists.")
  }
  const userId = generateRandomString();
  const newUser = {
    id:userId,
    email: userEmail,
    password: bcrypt.hashSync(userPass,10)
    
  }
  users[userId] = newUser;
  //const username = req.body.login
  res.cookie('user_id',userId)
  res.cookie("email",userEmail)
  console.log(users)
  res.redirect("/urls");
})

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//checks if the email address is already used
function getUserByEmail(email,usersDatabase) {
  const a = Object.values(usersDatabase);

  for(const user of a) {
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

const urlsForUser = function(userId,urlDatabase){
  const urls = { };
  for (const shrtUrl in urlDatabase) {
    if (urlDatabase[shrtUrl].userID === userId) {
      urls[shrtUrl] = urlDatabase[shrtUrl];
    }
  }
  return urls;
}
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
