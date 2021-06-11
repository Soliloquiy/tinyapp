const express = require("express");
//Require encryption for storing passwords
const bcrypt = require("bcryptjs");
//Require body-parser for cookie data
const cookieSession = require('cookie-session')
//Require body-parser for POST data
const bodyParser = require("body-parser");
const { getUserByEmail, getURLByID } = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

// console.log(getURLByID("userRandomID"), urlDatabase)
//cookie parser to encrypt cookie data and make readable
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
//body parser to make POST data readable
//convert request body from buffer to readable string
app.use(bodyParser.urlencoded({extended: true}));

//set view engine to ejs
app.set("view engine", "ejs");

//Database for url
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  ism5xK: { longURL: "http://www.google.com", userID: "aJ48lW" }
};
//Database for users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "12"
  }
}


function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}

app.get("/", (req, res) => {
  user = users[req.session.id]
  if (user) {
    return res.redirect("/urls")
  }
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  user = users[req.session.id]
  if (user) {
    return res.redirect("/urls")
  }
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  //Error handling
  if (!req.body.email || !req.body.password) {
    return res.status("400").send("Invalid inputs...")
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status("400").send("Email already exists...")
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      const email = req.body.email;
      const password = hash;
      //create variable to store generated id
      const id = generateRandomString();
      //create new user object with above variables
      //can use shorthand notation for user object
      const user = {id, email, password}
      //Add new user object to user database
      users[id] = user;
      console.log(user)
      //set user_id cookie containing newly generated id
      req.session.id = id;
      // res.cookie("id", id);

      res.redirect("/urls")
    })
  })
});

app.get("/login", (req, res) => {
  user = users[req.session.id]
  if (user) {
    return res.redirect("/urls")
  }
  res.render("urls_login");
});

app.get("/urls", (req, res) => {
  user = users[req.session.id]
  if (!user) {
    return res.status("400").send("Must be logged in to access...")
  }
  const templateVars = { user, urls: getURLByID(req.session.id, urlDatabase) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  user = users[req.session.id]
  if (!user) {
    return res.redirect("/login")
  }
  const templateVars = {user}
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  user = users[req.session.id]
  //save shortURL-longURL pair to urlDatabase
  const shortURL = generateRandomString();
  //longURL established in urls-new.ejs as POST input name
  const templateVars = {user, shortURL: shortURL, longURL: req.body.longURL};
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.id }
  res.redirect("/urls/" + shortURL);
});

//Pointer and display info contained in _header.ejs
//create new login page to set cookie
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users)
  if (!user) {
    return res.status("403").send("E-mail cannot be found...")
  }
  //change callback variable name to "response" to separate from express res
  bcrypt.compare(req.body.password, user.password, (err, response) => {
    if (response) {
      req.session.id = user.id;
      // res.cookie("id", user.id)
      res.redirect("/urls")
      return;
    }
    res.status("403").send("Password does not match...")
  })
})

app.post("/logout", (req, res) => {
  req.session = null;
  // res.clearCookie("id");
  res.redirect("/urls")
})

//: indicates route paramater
// will redirect to any resource that is inputted after :
// resource value is stored in req.params in form "shortURL":"shortURL"
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.id) {
    return res.status("400").send("Must be logged in to edit...")
  }
  user = users[req.session.id]
  // error message if user is logged in but accesses a URL that is not theirs
  if (Object.keys(getURLByID(req.session.id, urlDatabase)).length === 0) {
    return res.status("400").send("This is not your URL...")
  }
  // error message if invalid shortURL is entered
  if (urlDatabase[req.params.shortURL] === undefined ) {
    return res.status("400").send("Invalid URL...")
  }
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.id) {
    return res.status("400").send("Must be logged in to delete...")
  }
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  if (!req.session.id) {
    return res.status("400").send("Must be logged in to edit...")
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect(`/urls`)
})

app.get("/u/:shortURL", (req, res) => {
  // error message if invalid shortURL is entered
  // will return undefined if not http//: format
  if (urlDatabase[req.params.shortURL] === undefined ) {
    return res.status("400").send("Invalid URL...")
  }
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
