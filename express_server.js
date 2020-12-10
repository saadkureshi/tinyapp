const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["1"]
}));


app.set('view engine', 'ejs');

//DATABASES

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "shwi43" },
  sgq3y6: { longURL: "https://www.reddit.com", userID: "userRandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("qwe", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// GET ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: filterURLDB(req.session.user_id), 
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[urlDatabase[req.params.shortURL].userID] //is this better than grabbing from cookie?
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//POST ROUTES

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (userEmail === "" || userPassword === "" ) {
    res.status(400).send('One or more fields are empty.');
  }

  if (userExists(userEmail)) {
    res.status(400).send('Account already exists.');
  } else {
    let id = generateRandomString();
    let hashedPassword = bcrypt.hashSync(userPassword, 10);
    users[id] = {};
    users[id]['id'] = id;
    users[id]['email'] = userEmail;
    users[id]['password'] = hashedPassword;
    // res.cookie('user_id', id);
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (userEmail === "" || userPassword === "" ) {
    res.status(400).send('One or more fields are empty.');
  }

  if (userExists(userEmail) && passwordMatches(userEmail, userPassword)) {
    // res.cookie('user_id', findID(userEmail));
    req.session["user_id"]= findID(userEmail);
    res.redirect("/urls");
  } else {
    res.status(400).send('Incorrect username or password.');
  }
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = {};
  urlDatabase[id].longURL = req.body.longURL;
  urlDatabase[id].userID = req.session.user_id;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(405).send("Permission denied.");
  }
});

app.post("/urls/:id", (req, res) => {
  if (users[req.session.user_id]) {
    urlDatabase[req.params.id] = {};
    urlDatabase[req.params.id].longURL = req.body.newURL;
    urlDatabase[req.params.id].userID = req.session.user_id;
    res.redirect("/urls");
  } else {
    res.status(405).send("Permission denied.");
  }
});

app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
  req.session = null;
  res.redirect("/urls");
});

// APP LISTEN FUNCTION

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// FUNCTIONS USED BY TINYAPP

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
function passwordMatches(userEmail, userPassword) {
  for (let id in users) {
    if (users[id].email === userEmail && bcrypt.compareSync(userPassword, users[id].password)) {
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

//function to return a filtered version of the URLs DB when given a user ID.
function filterURLDB (userID) {
  let filteredURLDB = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      filteredURLDB[url] = urlDatabase[url];
    }
  }
  return filteredURLDB;
}