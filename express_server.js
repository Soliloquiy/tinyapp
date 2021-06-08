const express = require("express");
//Require body-parser for POST data
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

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


// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  //save shortURL-longURL pair to urlDatabase
  const shortURL = generateRandomString();
  //longURL established in urls-new.ejs as POST input name
  const templateVars = {shortURL: shortURL, longURL: req.body.longURL};
  urlDatabase[shortURL] = req.body.longURL;
  res.render("urls_show", templateVars);
});

//: indicates route paramater
// will redirect to any resource that is inputted after :
// resource value is stored in req.params in form "shortURL":"shortURL"
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
