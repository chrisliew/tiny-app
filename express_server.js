var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080


function generateRandomString() {

  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
// generateRandomString()

app.set("view engine", "ejs");

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

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
   };

  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
//create new data here?
//push new data to database?
//redirect below?
//redirect does 3 things:
  // sets http status to 300 level
  // sets location header to path for redirect
  // sends repsonse back
// req.params gives you an object that specifies whatever at end as a key
// see find function, to iterate through array.
// write out steps here
// let x = req.params.whatever
  //add a new key value pair to URL Database
  let templateVars = {
    urls: urlDatabase
  }

  let random = generateRandomString()
  urlDatabase[random] = req.body.longURL;

  res.redirect('/urls/' + random);
});

app.get("/u/:shortURL", (req, res) => {

    var longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
    //1. Find URL in database
    // let urlID = req.params.id;

    delete urlDatabase[req.params.id];

  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  // 1. Find longURL in database
  let findURL = req.params.id;
  console.log("asdf" + findURL)
  // 2. Update it
  urlDatabase[findURL] = req.body.updatedLongURL;
  console.log(req.body.updatedLongURL)

  // res.render("urls_show", templateVars);


  res.redirect("/urls");

});


//3. redirect back


// // Update the dog
// app.post('/dogs/:id', (req, res) => {
//   // 1. Find the dog in the database
//   let dogId = req.params.id;
//   let targetDog = dogDatabase.find(function(dog) {
//     return dog.id === dogId;
//   })

//   // 2. Update it
//   targetDog.name = req.body.name;
//   targetDog.color = req.body.color;

//   // 3. Redirect to dog list
//   res.redirect('/dogs');
// });

