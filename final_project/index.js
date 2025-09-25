const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// Sessions for /customer routes
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// JWT auth gate for protected customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
  const authData = req.session.authorization;
  if (!authData || !authData.accessToken) {
    return res.status(403).json({ message: "User not logged in" });
  }

  jwt.verify(authData.accessToken, "access", (err, user) => {
    if (err) return res.status(403).json({ message: "User not authenticated" });
    req.user = user; // optional
    next();
  });
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));
