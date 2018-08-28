var express = require("express");
var cookieSession = require('cookie-session');

//*** HAD TO USE BCRYPTJS INSTEAD OF BCRYPT SEE HERE https://stackoverflow.com/questions/29320201/error-installing-bcrypt-with-npm
const bcrypt = require('bcryptjs');

var app = express();
app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080




app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.use(express.static(__dirname + '/public'));



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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'defaultUser',
    createDate: "03/04/2019"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'defaultUser',
    createDate: "02/03/2016"
  },
  "111111": {
    longURL: "http://www.si.com",
    userID: 'user4RandomID',
    createDate: "01/31/2018"
  }
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
  },
  "user3RandomID": {
    id: "hulkhogan",
    email: "gawker101@gmail.com",
    password: "$2a$10$NOEvyFbvyuRxc.XCW1l0nOTaR/gZg0dLu89.tD6G/G/osSf52jY8W"
  },
  "user4RandomID": {
    id: "patrickkane",
    email: "blackhawks@gmail.com",
    password: "$2a$10$fa3BzWlQXf4syGbkA/Cgoe5CVefeo2OyFWqkuzajC0XOPzjmZEtIK"
  }
};

app.get("/", (req, res) => {
  if(req.session.user_id === undefined) {
    res.redirect("/login");
  }
  else {
    res.redirect("/urls");
  }
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
  let filteredDatabase = urlsForUser(req.session.user_id);
    let templateVars = {
      urls: urlDatabase,
      userObject: users[req.session.user_id],
      cookies: req.session.user_id,
      filteredDatabase: filteredDatabase,
    };
  res.render("urls_index", templateVars);
});

//Filters the database by logged in user.
function urlsForUser(id) {
  let filteredDatabase = {};
  for(var keys in urlDatabase) {
    if(urlDatabase[keys].userID === id)  {
      filteredDatabase[keys] = urlDatabase[keys];
    }
  }
  return filteredDatabase;
}

//If logged in user then the form for new URL's will populate otherwise redirect to login.
app.get("/urls/new", (req, res) => {
  let templateVars = {userObject: users[req.session.user_id]};
  if(req.session.user_id === undefined) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  if(req.session.user_id === undefined) {
    res.redirect("/login");
  }
});

//** Very important to have all get requests for urls/xxx above this, so it's from most specific to least.
// Creates a new route /urls/:id and uses res.render to pass shortURL and longURL data to urls_show.ejs
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userObject: users[req.session.user_id],
    cookies: req.session.user_id,
    databaseUserID: urlDatabase[req.params.id].userID,
    createDate: urlDatabase[req.params.id].createDate
  }
  if(users[req.session.user_id] === undefined) {
    res.end("<html><body>400 Error: You are not logged in.  Please log in to see your short URL'S.</html></body>")
    res.redirect('/urls');
  }
  else {
  res.render("urls_show", templateVars);
  }
});

//Body parser library allows us to access POST request parameters, where we'll store in urlDatabase for now.
//Parses the app.post(urls) below to an object for example.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// This route will match the POST request from urls_new.ejs and handles it.
// After receive request (in urls/new) and the form is submitted, this adds a new key value pair
// (ShortURL and LongURL) and creates a new key and value in the database.  Redirects to the new page with ShortURL tag
app.post("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userObject: users[req.session.user_id]
  };
  let random = generateRandomString();
  if(templateVars.userObject === undefined) {
    res.redirect('/urls')
  }
  else if(templateVars.userObject) {
    urlDatabase[random] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
      createDate: today
    };
    res.redirect('/');
  };
});

// EDIT the longURL POST section
app.post("/urls/:id", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID) {
    let findURL = req.params.id;
    urlDatabase[findURL].longURL = req.body.updatedLongURL;
    res.redirect("/urls");
  }
  else {
    res.redirect("/urls");
  }
});


//With any URL that has /u/ with corresponding shortURL in the database, this will redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
    var longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//This matches the POST form in url_index. If user clicks it will delete the line.
app.post("/urls/:id/delete", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
  }
  else {
    res.redirect('/urls');
  }
  res.redirect("/urls");
});

// Logout button to clear cookies and redirect to /urls
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
})

// Adds a new user object in the global users object which keeps track of the newly
// registered user's email, password and user ID.  Generate Random User ID. Adds to user database.
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  let newEmail = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  for(var userID in users) {
    if(newEmail === users[userID].email) {
      res.end("<html><body>400 Error: Email already exists choose another one </body><html>\n");
    }
    else if(!newEmail | !password) {
      res.end("<html><body>400 Error: Email or Password not Entered in Correctly </body></html>\n");
  }
    else {
      users[randomID] = {
        id: randomID,
        email: newEmail,
        password: hashedPassword
      };
    }
  }
  req.session.user_id = randomID
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
})

app.post("/login", (req, res) =>  {
  let newEmail = req.body.emailLogin;
  const newPassword = req.body.passwordLogin;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

    for(var userId in users) {
    var user = users[userId];

    if(user.email === newEmail && (bcrypt.compareSync(newPassword, user.password)) === true) {
      req.session.user_id = userId;
      res.redirect("/urls");
      return;
    }
  }
  res.end("<html><body>400 Error: Email or Password not correctly entered </body></html>\n");
});

//Formula for today's date
let today = new Date();
let dd = today.getDate();
let mm = today.getMonth()+1; //January is 0!
let yyyy = today.getFullYear();
if(dd<10) {
    dd = '0'+ dd
}
if(mm<10) {
    mm = '0'+ mm
}
today = mm + '/' + dd + '/' + yyyy;





