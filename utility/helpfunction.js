// handle the errors
const path = require('path');
const fs = require('fs');

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

module.exports = {serveStaticFile,getContentType,parseBody,handleError};