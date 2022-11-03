const express = require("express");

const app = express();

const PORT = 8080; //deafult port 8080

const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");

const userLookUp = function (email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      console.log(users[userId].email)
      console.log(email)
      return users[userId];
    }
  }
  return null
};


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


app.use(cookieParser());


app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


const urlsForUser = function (user_id) {
  const userURL = {}
  for (let shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL]
    if (urlObj.userId === user_id) {
      userURL[shortURL] = urlObj
    }
  }
  return userURL;
};


app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"]
  let user = users[user_id]


  if (!user_id) {
    return res.send("LOGIN FOOL!")
  }

  const urls = urlsForUser(user_id)
  const templateVars = { urls, user };
  res.render("urlsIndex", templateVars)
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"]
  let user = users[user_id]
  const templateVars = { user };
  if (!user_id) {
    res.redirect("/Login")
  } else {
    res.render("urlsNew", templateVars);
  }
});



app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"]
  if (user_id) {
    res.redirect("/urls")
  } else {
    res.render("urlLogin")
  }

});


app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = userLookUp(email)
  if (email === "" || password === "") {
    return res.status(400).send("Please fill in the email or password")
  }
  if (!user) {
    return res.status(403).send("User does not exist")
  }
  if (password !== user.password) {
    return res.status(403).send("Password does not Match")
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls")
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/Login")
});


app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"]
  if (!user_id) {
    res.redirect("/urls")
  } else {
    res.render("urlRegistration")
  }
});


app.post("/register", (req, res) => {
  const email = req.body.email
  const id = generateRandomString();
  const password = req.body.password
  if (email === "" || password === "") {
    return res.status(400).send("Please fill in the email or password")
  }

  if (userLookUp(email)) {
    return res.status(400).send("User with that email already exists")
  }

  users[id] = { id, email, password }

  res.cookie("user_id", id)
  res.redirect("/urls")
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
  const user_id = req.cookies["user_id"]
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  if (!user_id) {
    return res.send("😛😛Only registered users can shorten URLS 😛😛")
  }
  urlDatabase[shortURL] = { longURL, userID: user_id }
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const user_id = req.cookies["user_id"]
  const user = users[user_id]
  if (!user_id) {
    return res.send("😛😛Login FOOL! 😛😛")
  }
  const urlObj = urlDatabase[id]
  if (!urlObj) {
    return res.send("That ShortURL does not exist")
  }
  const longURL = urlDatabase[id].longURL
  const templateVars = { id, longURL, user };
  res.render("urlsShow", templateVars)
});


app.post("/urls/:id/delete", (req, res) => {
  //Cookie validation
  const user_id = req.cookies["user_id"]
  if (!user_id) {
    return res.status(401).send("Please login")
  }

  //URL object validation
  const urlObj = urlDatabase[req.params.id]
  if (!urlObj) {
    return res.status(404).send("URL does not exist")
  }

  // Ownsership validation
  const urlBelongsToUser = urlObj.userID === user_id
  if (!urlBelongsToUser) {
    return res.status(403).send("You do not have access to this URL")
  }
  
  const id = req.params.id
  delete urlDatabase[id].longURL
  res.redirect("/urls/")
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id].longURL
  res.redirect(longURL)
});


app.post("/urls/:id", (req, res) => {
  //Cookie validation
  const user_id = req.cookies["user_id"]
  if (!user_id) {
    return res.status(401).send("Please login")
  }

  //URL object validation
  const urlObj = urlDatabase[req.params.id]
  if (!urlObj) {
    return res.status(404).send("URL does not exist")
  }

  // Ownsership validation
  const urlBelongsToUser = urlObj.userID === user_id
  if (!urlBelongsToUser) {
    return res.status(403).send("You do not have access to this URL")
  }

  const id = req.params.id
  urlDatabase[id].longURL = req.body.updatedURL
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});