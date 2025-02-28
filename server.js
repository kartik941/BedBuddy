const http = require('http');
// const qs = require('querystring');
const fs = require('fs');
const path = require('path');

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


// Create HTTP server
const server = http.createServer((req, res) => {
    const publicDir = path.join(__dirname, 'public');
        const urlPath = req.url === '/' ? '/index.html':req.url === '/login' ? '/login.html':req.url === '/register' ? '/register.html' : req.url;
    // const publicDir = path.join(__dirname, 'public');
    if (req.url.startsWith('/images/')) {
            // Dynamically serve image files
            const filePath = path.join(publicDir, req.url);
            serveStaticFile(filePath, res);
        } else {
            const filePath = path.join(publicDir, urlPath);
    
    
    if (req.method === 'GET') {
        // Serve the file based on the URL
        serveStaticFile(filePath, res);

        } else if (req.method === 'POST' && req.url === '/register') {
            parseBody(req, (body) => {
                const uname = body.get('uname');
                const upwd = body.get('upwd');
                
                // Read users from the users.json file
                const users = JSON.parse(fs.readFileSync('C:/Users/kk673/OneDrive/Desktop/be project/user.json', 'utf-8'));
                
                // Check if the uname already exists
                if (users.find(user => user.uname === uname)) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('username already exists.');
                    return;
                }
    
                // Add the new user (uname and upwd in plain text)
                users.push({ uname, upwd });
                fs.writeFileSync('C:/Users/kk673/OneDrive/Desktop/be project/user.json', JSON.stringify(users, null, 2));
                
                res.writeHead(302, { 'Location': '/login' });
                res.end();
            });
        }
    
        // Handle login (POST to /login)
        else if (req.method === 'POST' && req.url === '/login') {
            parseBody(req, (body) => {
                const uname = body.get('uname');
                const upwd = body.get('upwd');
                
                // Read users from the users.json file
                const users = JSON.parse(fs.readFileSync('C:/Users/kk673/OneDrive/Desktop/be project/user.json', 'utf-8'));
                
                // Check if the uname exists
                const user = users.find(user => user.uname === uname);
                
                // If uname does not exist or upwd is incorrect
                if (!user || user.upwd !== upwd) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Invalid username or password.' }));
                    return;
                }
    
                // Successful login
                // res.writeHead(200, { 'Content-Type': 'text/plain' });
                // res.end('Login successful!');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Login successful!' }));
            });
    } else {
        handleError(res, 404, 'Route not found');
    }
}});



// Start the server on port 8081
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
