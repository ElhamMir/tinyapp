const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs")
const bcrypt = require('bcrypt');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const username = req.cookies.email;
  const email = users["username"]
  
  const templateVars = { 
    urls: urlDatabase ,
    username,
    user: users[username],
    email
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies["user"];
  if(!username) {
    return res.redirect("/login");
  }
  const templateVars = { 
    username
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL],
    username: req.cookies["user"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let j = generateRandomString();
  urlDatabase[j] = req.body.longURL
  //urlDatabase[j] = req.body
  console.log(req.body,"req")
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.body.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log(res);
  // console.log(req)
  urlDatabase[req.params.shortURL] = req.body.longURL
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
  const user = newEmail(email)
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
  res.clearCookie('user')
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
 if(newEmail(userEmail)){
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
function newEmail(email) {
  const a = Object.values(users);

  for(const user of a) {
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
