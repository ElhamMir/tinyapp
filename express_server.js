const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs")

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
  const username = req.cookies["user"];
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
  //const username = req.body.login
  res.cookie('user',req.body.email)
  console.log(req.body)
  res.redirect("/urls");
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
    res.send("Email or password is missing.")
  }
 // if(!emailAvailable(userEmail)){
  ////  res.send("A user with this email already exists.")
  //}
  const userId = generateRandomString();
  users[userId] = {
    id:userId,
    email: userEmail,
    password: userPass
    
  }
  //const username = req.body.login
  res.cookie('user_id',userId)
  console.log(users)
  res.redirect("/urls");
})

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//checks if the email address is already used
function emailAvailable(email) {
  for (i in users) {
    if (i[email] === email) {
      return false;
    }
    return true;
  }
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
