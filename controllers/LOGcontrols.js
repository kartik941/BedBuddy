const path = require('path');
const fs = require('fs');

const usersFile = path.join(__dirname, '../data/user.json'); 

const getlogin = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));  // ✅ Fix path
};

// Handle user login (POST request)
const postlogin = (req, res) => {
    const { uname, upwd } = req.body;

    // Read users from JSON file
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

    // Check if user exists
    const user = users.find(user => user.uname === uname);

    if (!user || user.upwd !== upwd) {
        return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    res.json({ success: true, message: 'Login successful!' });
};

// Serve register.html when visiting /register
const getregister = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
};

// Handle user registration (POST request)
const postregister = (req, res) => {
    const { uname, upwd } = req.body;

    if (!uname || !upwd) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Read users from JSON file
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

    // Check if username already exists
    if (users.find(user => user.uname === uname)) {
        return res.status(400).json({ success: false, message: 'Username already exists.' });
    }

    // Add new user
    users.push({ uname, upwd });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    //res.status(201).json({ success: true, message: 'Registration successful!' });
    res.redirect('/login')
};

module.exports = {postlogin,postregister,getlogin, getregister};
