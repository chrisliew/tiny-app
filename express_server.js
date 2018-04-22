var express = require("express");
var cookieSession = require('cookie-session');

//this tells Express to use EJS as it's templating engine
var app = express();
app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080

// app.use((req, res, next) => {
//   // const { username }  = req.cookies;
//   // res.locals.username = username;
//   const { user } = req.session;
//   res.locals.users = users
//   next();
// });


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']

  // // Cookie Options
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

    //create function that returns subset of URL database with id
    //if cookie is equal to database userID then filter here
    //if no cookie then want to display no database

function urlsForUser(id) {
  let filteredDatabase = {};
  for(var keys in urlDatabase) {
    if(urlDatabase[keys].userID === id)  {
      filteredDatabase[keys] = urlDatabase[keys];
    }
  }
  return filteredDatabase;
}


//Creates a new GET route urls/new to present form to user. This will render the page with the form.
app.get("/urls/new", (req, res) => {
  let templateVars = {userObject: users[req.session.user_id]};
  if(req.session.user_id === undefined) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});


app.post("/urls/new", (req, res) => {
console.log("redirect check");
  if(req.session.user_id === undefined) {
    res.redirect("/login");
  }
});

//** Very important to have all get requests for urls/xxx above this, so it's from most specific to least.
// Creates a new route /urls/:id and uses res.render to pass shortURL and longURL data to urls_show.ejs
//if user logged in but doesn't own URL with ID, return HTML saying: you don't own URL!
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

    res.redirect('/urls/' + random);
  };
});

//App.Post so the order doesn't matter.  When form at urls_show is clicked, looks at the long URL.
// EDIT portion
app.post("/urls/:id", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID) {
    let findURL = req.params.id;
    urlDatabase[findURL].longURL = req.body.updatedLongURL;
    res.redirect("/urls");
  }
  else {
    // res.end("<html><body>400 Error: You do not own this URL with your given ID</html></body>")
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
})




//This will take the form data from login.ejs. SETS the cookie using res.cookie.


//If the button logout is clicked this will execute.
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
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
    password: "$2a$10$NOEvyFbvyuRxc.XCW1l0nOTaR/gZg0dLu89.tD6G/G/osSf52jY8W"
  },
  "user4RandomID": {
    id: "patrickkane",
    email: "blackhawks@gmail.com",
    password: "$2a$10$fa3BzWlQXf4syGbkA/Cgoe5CVefeo2OyFWqkuzajC0XOPzjmZEtIK"
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
  console.log(users)
  req.session.user_id = randomID
  res.redirect("/urls");

});


app.get("/login", (req, res) => {
  res.render("login");
})


app.post("/login", (req, res) =>  {
  //if login email and login password is equal to the users[emailloign].email and password
  //then login to the website
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

//*** HAD TO USE BCRYPTJS INSTEAD OF BCRYPT SEE HERE https://stackoverflow.com/questions/29320201/error-installing-bcrypt-with-npm
const bcrypt = require('bcryptjs');

//Formula for today's date
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd = '0'+dd
}

if(mm<10) {
    mm = '0'+mm
}

today = mm + '/' + dd + '/' + yyyy;





