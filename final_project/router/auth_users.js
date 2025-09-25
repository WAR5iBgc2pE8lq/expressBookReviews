const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// Shared users array (used by /register in general.js)
let users = [];

// Is a username already taken?
const isValid = (username) => users.some(u => u.username === username);

// Do username+password match?
const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

// Task 7: login and store JWT in session
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  if (!authenticatedUser(username, password))
    return res.status(401).json({ message: "Invalid username or password" });

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// Task 8: add/modify review (we’ll test this in the next step)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review;
  if (!req.session.authorization?.username)
    return res.status(403).json({ message: "User not logged in" });
  if (!review)
    return res.status(400).json({ message: "Missing 'review' query parameter" });

  const username = req.session.authorization.username;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (!book.reviews) book.reviews = {};
  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated", reviews: book.reviews });
});

// Task 9: delete review (we’ll test this later)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  if (!req.session.authorization?.username)
    return res.status(403).json({ message: "User not logged in" });

  const username = req.session.authorization.username;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Your review was deleted", reviews: book.reviews });
  }
  return res.status(404).json({ message: "You have no review for this book" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
