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


app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    urls: urlDatabase,
   }
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {

let params = {
  id: 'b2xVn2',
  long: "http://www.lighthouselabs.ca"
}
  let templateVars = {
    shortURL: params.id,
    longURL: params.long
  };
  res.render("urls_show", templateVars);

});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});




// In express_server.js, add a new route handler for "/urls" and use res.render() to pass the URL data to your template.
// Use the example below as a reference for what this route handler should look like.
// Since you modified your server file (express_server.js), restart your Express server (you can shut it down with Ctrl + C in your Terminal, then start it up again with the command node express_server.js) and browse to http://localhost:8080/urls.
// This will be a blank page right now – that's expected! You'll be filling it out with content in the next step.