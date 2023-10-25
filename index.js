const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Dummy data
const users = [
  { id: 1, username: 'admin', password: 'password', name: 'Admin User' },
];

// Secret key for JWT
const secretKey = 'the_secret_key';

// User CRUD Endpoints
app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Authentication Middleware
app.use((req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token is required.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ error: 'Invalid token.' });
  }
});

// Protected User CRUD Endpoints
app.post('/users', (req, res) => {
  console.log('creating a new user');
});

app.put('/users/:id', (req, res) => {
  console.log('updating a user');
});

app.delete('/users/:id', (req, res) => {
  console.log('deleting a user');
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign({ username: user.username }, secretKey);
    res.json({ username: user.username, name: user.name, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
