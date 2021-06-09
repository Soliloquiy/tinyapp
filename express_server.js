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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  console.log(urlDatabase)
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //save shortURL-longURL pair to urlDatabase
  const shortURL = generateRandomString();
  //longURL established in urls-new.ejs as POST input name
  const templateVars = {username: req.cookies["username"], shortURL: shortURL, longURL: req.body.longURL};
  urlDatabase[shortURL] = req.body.longURL;
  res.render("urls_show", templateVars);
});
//Pointer and display info contained in _header.ejs
//create new login page to set cookie
app.post("/login", (req, res) => {
  //set cookie to a value with res.cookie
  //req.cookie to access value
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

//: indicates route paramater
// will redirect to any resource that is inputted after :
// resource value is stored in req.params in form "shortURL":"shortURL"
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
