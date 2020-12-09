const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set('view engine', 'ejs');

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
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (userEmail === "" || userPassword === "" ) {
    res.status(400).send('One or more fields are empty');
  }

  if (userExists(userEmail)) {
    res.status(400).send('Account already exists.');
  } else {
    let id = generateRandomString();
    users[id] = {};
    users[id]['id'] = id;
    users[id]['email'] = userEmail;
    users[id]['password'] = userPassword;
    res.cookie('user_id', id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (userEmail === "" || userPassword === "" ) {
    res.status(400).send('One or more fields are empty');
  }

  if (userExists(userEmail) && passwordMatches(userPassword)) {
    res.cookie('user_id', findID(userEmail));
    res.redirect("/urls");
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let charSet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += charSet[Math.floor(Math.random() * charSet.length)];
  }
  return id;
}

//function to check if email already exists in database and send back true or false.
function userExists(userEmail) {
  for (let id in users) {
    if (users[id].email === userEmail) {
      return true;
    }
  }
  return false;
}

//function to check if entered password matches with one in database. Returns true or false.
function passwordMatches(userPassword) {
  for (let id in users) {
    if (users[id].password === userPassword) {
      return true;
    }
  }
  return false;
}

//function to return id from users database for a given email.
function findID(userEmail) {
  for (let id in users) {
    if (users[id].email === userEmail) {
      return users[id].id;
    }
  }
  return false;
}