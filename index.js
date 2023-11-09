const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const sendGrid = require('@sendgrid/mail');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/airline', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
});

const User = mongoose.model('User', userSchema);

// Secret key for JWT
const secretKey = 'the_secret_key';

// Dummy data
const users = [
  { id: 1, username: 'admin', password: 'password', name: 'Admin User' },
];

// Send Email Function
async function sendEmail(email, subject, body) {
  const msg = {
    to: email,
    from: 'admin@example.com',
    subject,
    text: body,
  };
  const client = new sendGrid.MailService(process.env.SENDGRID_API_KEY);
  await client.send(msg);
}

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

// User CRUD Endpoints
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/users', async (req, res) => {
  const { username, password, name } = req.body;

  try {
    const newUser = new User({ username, password, name });
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, password, name } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, {
      username,
      password,
      name,
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (user) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign({ username: user.username }, secretKey);
      res.json({ username: user.username, name: user.name, token });
    } else {
      res.status(401).json({ error: 'Invalid credentials.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
