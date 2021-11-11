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
  const username = req.cookies["username"];
  if(!username) {
    return res.status(400).send("you are not logged in");
  }
  const templateVars = { 
    urls: urlDatabase ,
    username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
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
    username: req.cookies["username"]
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
  const username = req.cookies["username"];
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
  res.cookie('username',req.body.email)
  console.log(req.body)
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/login");
})

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
