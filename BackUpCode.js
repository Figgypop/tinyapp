////////////////////////////////////////////////////IMPORTS///////////////////////////////////////////////////////////

const express = require("express");

const bcrypt = require("bcryptjs");

const helper = require('./views/helper');

const cookieSession = require('cookie-session');

const app = express();

const PORT = 8080;

app.set("view engine", "ejs");

////////////////////////////////////////DATABASES/////////////////////////////////////////////////////////////////////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },

  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },

};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "qwerty",
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123456",
  },

};

/////////////////////////////////////////////////////MIDDLEWARE////////////////////////////////////////////////

app.use(cookieSession({
  name: 'session',
  keys: ["Random String"],

  maxAge: 24 * 60 * 60 * 1000 
}))

app.use(express.urlencoded({ extended: true }));

///////////////////////////////////////////////////HELPER FUNCTIONS////////////////////////////////////////////////////////////////

const urlsForUser = function (user_id) {
  const userURL = {}
  for (let shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL];
    if (urlObj.userID === user_id) {
      userURL[shortURL] = urlObj;
    }

  }

  return userURL;
};

////////////////////////////////////////////////ROUTES///////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];

  if (!user_id) {
    return res.send("LOGIN FOOL!");
  }

  const urls = urlsForUser(user_id);
  const templateVars = { urls, user };
  res.render("urlsIndex", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];
  const templateVars = { user };
  
  if (!user_id) {
    res.redirect("/Login");
  } else {
    res.render("urlsNew", templateVars);

  }

});



app.get("/login", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render("urlLogin");
  }

});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = helper(email, users);
  if (email === "" || password === "") {
    return res.status(400).send("Please fill in the email or password");
  }

  if (!user) {
    return res.status(403).send("User does not exist");
  }

  if (!bcrypt.compareSync(password, user.password)) { // first arg is what the user typed, the second is the hashed password in the object taht belongs to that user
    return res.status(403).send("Password does not Match");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/Login");
});


app.get("/register", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render("urlRegistration");
  }

});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const id = generateRandomString();
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    return res.status(400).send("Please fill in the email or password");
  }

  if (helper(email, users)) {
    return res.status(400).send("User with that email already exists");
  }

  users[id] = { id, email, password: hashedPassword }

  req.session.user_id = id;
  res.redirect("/urls");
});


function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};
 

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  if (!user_id) {
    return res.send("😛😛Only registered users can shorten URLS 😛😛");
  }

  urlDatabase[shortURL] = { longURL, userID: user_id }
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  const user = users[user_id];

  if (!user_id) {
    return res.send("😛😛Login FOOL! 😛😛")
  }
  const urlObj = urlDatabase[id];
  if (!urlObj) {
    return res.send("That ShortURL does not exist");
  }
  
  const longURL = urlDatabase[id].longURL;
  const templateVars = { id, longURL, user };
  res.render("urlsShow", templateVars);
});


app.post("/urls/:id/delete", (req, res) => {
  //Cookie validation
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).send("Please login");
  }

  //URL object validation
  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) {
    return res.status(404).send("URL does not exist");
  }

  // Ownsership validation
  const urlBelongsToUser = urlObj.userID === user_id;
  if (!urlBelongsToUser) {
    return res.status(403).send("You do not have access to this URL");
  }

  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls/");
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});


app.post("/urls/:id", (req, res) => {
  //Cookie validation
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).send("Please login");
  }

  //URL object validation
  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) {
    return res.status(404).send("URL does not exist");
  }

  // Ownsership validation
  const urlBelongsToUser = urlObj.userID === user_id;
  if (!urlBelongsToUser) {
    return res.status(403).send("You do not have access to this URL");
  }

  const id = req.params.id;
  urlDatabase[id].longURL = req.body.updatedURL;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});