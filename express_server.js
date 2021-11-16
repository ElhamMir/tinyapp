const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {getUserByEmail, generateRandomString} = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['hello'],
  maxAge: 24 * 60 * 60 * 1000// 24 hours
}));

app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


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
  const username = req.session.user_id;
  const email = req.session.email;
  
  const templateVars = {
    urls: urlsForUser(username,urlDatabase) ,
    username,
    user: users[username],
    email
   
  };
  console.log(users[username],username);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.session.user_id;
  const email = req.session.email;
  if (!username) {
    return res.redirect("/login");
  }
  const templateVars = {
    username,
    email
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const email = req.session.email;
  if (!userId) {
    console.log("user is invalid");
    res.status(400).send("You do not have permission to visit this page");
    
  } else if (urlDatabase[shortURL].longURL && urlDatabase[shortURL].userID === userId) {
    const templateVars = {
      shortURL,
      longURL:urlDatabase[shortURL].longURL,
      username: req.session.user_id,
      email
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId
  };
  res.redirect("/urls");
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL].longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const username = req.session["user"];
  const email = req.body.email;
  if (username) {
    return res.redirect("/urls");
  }
  const templateVars = {
    username: null,
    email
  };
  
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,users);
  if (!user) {
    return res.status(401).send("No User");
  } else if (!bcrypt.compareSync(password,users[user].password)) {
    return res.status(401).send("Invalid Username or Password");
  }
  req.session["user_id"] = user;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: null
  };
  res.render("register",templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const userPass = req.body.password;

  if (!email || !userPass) {
    return res.send("Email or password is missing.");
  }
  if (getUserByEmail(email,users)) {
    return res.status(401).send("A user with this email already exists.");
  }
  const userId = generateRandomString();
  const newUser = {
    id:userId,
    email: email,
    password: bcrypt.hashSync(userPass,10)
    
  };
  users[userId] = newUser;
  req.session.user_id = userId;
  req.session.email = email;
  res.redirect("/urls");
});



const urlsForUser = function(userId,urlDatabase) {
  const urls = {};
  for (const shrtUrl in urlDatabase) {
    if (urlDatabase[shrtUrl].userID === userId) {
      urls[shrtUrl] = urlDatabase[shrtUrl];
    }
  }
  return urls;
};
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
