const express = require("express");

const app = express();

const PORT = 8080; //deafult port 8080

const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");

const userLookUp = function (email) {
  for(let userId in users) {
    if(users[userId].email === email ) {
      console.log(users[userId].email)
      console.log(email)
      return users[userId];
    }
  }
  return null
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
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


app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"]
  let user = users[user_id]
  const templateVars = { urls: urlDatabase, user};
  res.render("urlsIndex", templateVars)
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"]
  let user = users[user_id]
  const templateVars = {user};
  res.render("urlsNew", templateVars);
});

app.get("/login", (req, res) => {
  res.render("urlLogin")
})


app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = userLookUp(email)
  if(email === "" || password === "") {
    return res.status(400).send("Please fill in the email or password")
  } 
  if(!user) {
  return res.status(404).send("User does not exist")
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/register")
});


app.get("/register", (req, res) => {
  // const user_id = req.cookies["user_id"]
  // let user = users[user_id]
  // const email = user && user.email || ""
  // const templateVars = { email }
  res.render("urlRegistration")
});


app.post("/register", (req, res) => {
  const email = req.body.email
  const id = generateRandomString();
  const password = req.body.password
  if(email === "" || password === "") {
    return res.status(400).send("Please fill in the email or password")
  } 
  
  if(userLookUp(email)) {
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
  console.log(req.body.longURL)
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  const user_id = req.cookies["user_id"]
  const user = users[user_id]
  const templateVars = { id, longURL, user};
  res.render("urlsShow", templateVars)
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect("/urls/")
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL)
});


app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  urlDatabase[id] = req.body.updatedURL
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});