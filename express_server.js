var express = require("express");
var cookieParser = require('cookie-parser');

//this tells Express to use EJS as it's templating engine
var app = express();
app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080

app.use(cookieParser());

app.use((req, res, next) => {
  const { username }  = req.cookies;
  res.locals.username = username;
  next();
});

//Generates a random 6 digit number for the shortURL.
function generateRandomString() {

  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//Creates a new route urls and uses res.render to pass URL data to urls_index.ejs
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});


//Creates a new GET route urls/new to present form to user. This will render the page with the form.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/login", (req, res) => {
  res.render("login");
})


//** Very important to have all get requests for urls/xxx above this, so it's from most specific to least.
// Creates a new route /urls/:id and uses res.render to pass shortURL and longURL data to urls_show.ejs
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//Body parser library allows us to access POST request parameters, where we'll store in urlDatabase for now.
//Parses the app.post(urls) below to an object for example.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// This route will match the POST request from urls_new.ejs and handles it.
// After receive request (in urls/new) and the form is submitted, this adds a new key value pair
// (ShortURL and LongURL) and creates a new key and value in the database.  Redirects to the new page with ShortURL tag
app.post("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect('/urls/' + random);
});

//With any URL that has /u/ with corresponding shortURL in the database, this will redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
    var longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//This matches the POST form in url_index. If user clicks it will delete the line.
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

//App.Post so the order doesn't matter.  When form at urls_show is clicked, looks at the long URL.
//Uses BODY below to pull data from the urls_show that entered in then updates the longURL (posts to it)
app.post("/urls/:id", (req, res) => {
  // 1. Find longURL in database
  let findURL = req.params.id;
  // 2. Updates it
  urlDatabase[findURL] = req.body.updatedLongURL;
  res.redirect("/urls");

});

//This will take the form data from login.ejs. SETS the cookie using res.cookie.
app.post("/login", (req, res) =>  {
  res.cookie("username", req.body['username']);
  res.redirect("/urls");
});

//If the button logout is clicked this will execute.
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body['username']);
  res.redirect("/urls");
});

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
  },
  "user3RandomID": {
    id: "hulkhogan",
    email: "gawker101@gmail.com",
    password: "brother"
  },
  "user4RandomID": {
    id: "patrickkane",
    email: "blackhawks@gmail.com",
    password: "stanley"
  }
};

app.get("/register", (req, res) => {
  res.render("register");
})

// Adds a new user object in the global users object which keeps track of the newly
// registered user's email, password and user ID.  Generate Random User ID. Adds to user database.
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  let newEmail = req.body.email;
  let newPassword = req.body.password;
  users[randomID] = {
    id: randomID,
    email: newEmail,
    password: newPassword
  };
  res.cookie("user_id", randomID);

  console.log(users);
  res.redirect("/urls");

});






