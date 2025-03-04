const express = require('express');
const fs = require('fs');
const path = require('path');


const app = express();
// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
const usersFile = path.join(__dirname, 'user.json');


// handle the errors
function handleError(res, errorCode, message) {
    res.statusCode = errorCode;
    res.write(message);
    res.end();
}
function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        callback(new URLSearchParams(body));
    });
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'application/javascript';
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.ico': return 'image/x-icon';
        case '.json': return 'application/json';
        case '.svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
    }
}

// Function to serve static files
function serveStaticFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('404 Not Found');
            } else {
                res.statusCode = 500;
                res.end('500 Internal Server Error');
            }
        } else {
            const contentType = getContentType(filePath);
            res.setHeader('Content-Type', contentType);
            res.end(data);
        }
    });
}


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle user login (POST request)
app.post('/login', (req, res) => {
    const { uname, upwd } = req.body;

    // Read users from JSON file
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

    // Check if user exists
    const user = users.find(user => user.uname === uname);

    if (!user || user.upwd !== upwd) {
        return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    res.json({ success: true, message: 'Login successful!' });
});

// Serve register.html when visiting /register
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle user registration (POST request)
app.post('/register', (req, res) => {
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
});

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start the server on port 8081
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
