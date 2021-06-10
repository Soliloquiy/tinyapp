const express = require("express");
//Require body-parser for cookie data
const cookieParser = require('cookie-parser')
//Require body-parser for POST data
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

//cookie parser to make cookie data readable
app.use(cookieParser());
//body parser to make POST data readable
//convert request body from buffer to readable string
app.use(bodyParser.urlencoded({extended: true}));

//set view engine to ejs
app.set("view engine", "ejs");

//Database for url
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//user email lookup
function getUserByEmail(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
}

app.get("/register", (req, res) => {
  user = users[req.cookies.id]
  const templateVars = { user }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  //Error handling
  if (!req.body.email || !req.body.password) {
    return res.status("400").send("Invalid inputs...")
  }
  if (getUserByEmail(req.body.email)) {
    return res.status("400").send("Email already exists...")
  }
  //create variables to capture post info
  const email = req.body.email;
  const password = req.body.password;
  //create variable to store generated id
  const id = generateRandomString();
  //create new user object with above variables
  //can use shorthand notation for user object
  const user = {id, email, password}
  //Add new user object to user database
  users[id] = user;
  //set user_id cookie containing newly generated id
  res.cookie("id", id);

  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  user = users[req.cookies.id]
  const templateVars = { user }
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  user = users[req.cookies.id]
  const templateVars = { users, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  user = users[req.cookies.id]
  const templateVars = {users}
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  user = users[req.cookies.id]
  //save shortURL-longURL pair to urlDatabase
  const shortURL = generateRandomString();
  //longURL established in urls-new.ejs as POST input name
  const templateVars = {users, shortURL: shortURL, longURL: req.body.longURL};
  urlDatabase[shortURL] = req.body.longURL;
  res.render("urls_show", templateVars);
});

//Pointer and display info contained in _header.ejs
//create new login page to set cookie
app.post("/login", (req, res) => {
  //set cookie to a value with res.cookie
  //req.cookie to access value
  const user = getUserByEmail(req.body.email)
  if (!user) {
    return res.status("403").send("E-mail cannot be found...")
  }
  if (user.password !== req.body.password) {
    return res.status("403").send("Password does not match...")
  }
  res.cookie("id", user.id)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/urls")
})

//: indicates route paramater
// will redirect to any resource that is inputted after :
// resource value is stored in req.params in form "shortURL":"shortURL"
app.get("/urls/:shortURL", (req, res) => {
  user = users[req.cookies.id]
  const templateVars = { users, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect(`/urls/${req.params.shortURL}`)
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
