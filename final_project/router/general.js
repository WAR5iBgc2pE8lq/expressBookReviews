const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // basic validation
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // check if username already exists
  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // add new user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can log in." });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const results = [];
  for (let key in books) {
    if (books[key].author === author) {
      results.push({ isbn: key, ...books[key] });
    }
  }
  if (results.length > 0) {
    return res.status(200).send(JSON.stringify(results, null, 2));
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const results = [];
  for (let key in books) {
    if (books[key].title === title) {
      results.push({ isbn: key, ...books[key] });
    }
  }
  if (results.length > 0) {
    return res.status(200).send(JSON.stringify(results, null, 2));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

/* ============================
   Tasks 10–13: Async/Await (Axios)
   ============================ */

// Task 10: Get all books using async/await with Axios
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch books asynchronously' });
  }
});

// Task 11: Get book details by ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const response = await axios.get(`http://localhost:5000/isbn/${encodeURIComponent(isbn)}`);
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch book by ISBN asynchronously' });
  }
});

// Task 12: Get book details by author using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch books by author asynchronously' });
  }
});

// Task 13: Get book details by title using async/await with Axios
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch books by title asynchronously' });
  }
});

module.exports.general = public_users;
