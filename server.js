const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(session({
    secret: 's3cr3tK3Y', // Change this to a secure key in production
    resave: false,
    saveUninitialized: false
  }));
// User data
let users = [];
let todoLists = [];

// Create a new todo list for an authenticated user
app.post('/api/todos', (req, res) => {
  // Check if user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.session.user.id;
  const { todo } = req.body;

  // Find the user's todo list or create a new one
  let userTodoList = todoLists.find(list => list.id === userId);
  if (!userTodoList) {
    userTodoList = {
      id: userId,
      todos: []
    };
    todoLists.push(userTodoList);
  }

  // Add the new todo to the user's todo list
  userTodoList.todos.push(todo);

  // Send the user's todo object as a response
  res.json(userTodoList);
});

// Retrieve a list of all todo lists
app.get('/api/todos/list', (req, res) => {
  // Check if user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Send the list of all todo objects as a response
  res.json(todoLists);
});

app.post('/api/user/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
      }

    const { username, password } = req.body;
  
    // Find the user by username
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  
    // Compare the password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'An error occurred' });
      }
  
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Set the user in the session
      req.session.user = user;
  
      // Send a success response
      res.sendStatus(200);
    });
  });

app.get('/api/user/list', (req, res) => {
    res.json(users);
  });

// Register a new user
app.post('/api/user/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
      }

  const { username, password } = req.body;
    console.log(req.body)
  // Check if username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Hash the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred' });
    }

    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: 'An error occurred' });
      }

      // Create a new user object
      const newUser = {
        id: users.length + 1,
        username,
        password: hash
      };

      // Save the user
      users.push(newUser);

      // Send the created user object back
      res.status(201).json(newUser);
    });
  });
});

app.get('/api/secret', (req, res) => {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    // If the user is authenticated, respond with a success status
    res.sendStatus(200);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
