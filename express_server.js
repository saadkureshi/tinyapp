const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString, userExists, passwordMatches, findID, filterURLDB } = require('./helpers');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
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
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// GET ROUTES

app.get("/", (req, res) => {
  if (req.session.isNew) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  if (req.session.isNew) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  if (req.session.isNew) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: filterURLDB(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.isNew) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.isNew) {
    res.redirect("/login");
  } else if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('Requested resource could not be located.');
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('Requested resource could not be located.');
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//POST ROUTES

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    res.status(400).send('One or more fields are empty.');
  }
  if (userExists(userEmail, users)) {
    res.status(400).send('Account already exists.');
  } else {
    let id = generateRandomString();
    let hashedPassword = bcrypt.hashSync(userPassword, 10);
    users[id] = {};
    users[id]['id'] = id;
    users[id]['email'] = userEmail;
    users[id]['password'] = hashedPassword;
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    res.status(400).send('One or more fields are empty.');
  }
  if (userExists(userEmail, users) && passwordMatches(userEmail, userPassword, users)) {
    req.session["user_id"] = findID(userEmail, users);
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
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.status(405).send("Permission denied.");
    }
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
  req.session = null;
  res.redirect("/urls");
});

// APP LISTEN FUNCTION

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});