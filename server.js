const express = require('express');
const fs = require('fs');
const path = require('path');


const app = express();

const { handleError, parseBody, getContentType, serveStaticFile } = require('./utility/helpfunction');

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
const usersFile = path.join(__dirname, 'user.json');

const routes =require('./routes/LOGroutes');

app.use('/',routes);

const morgan = require('morgan');
app.use(morgan('combined')); // Logs detailed request info

const helmet = require('helmet');
app.use(helmet()); // Applies default security headers

const cors = require('cors');
app.use(cors()); // Enables CORS for all routes


const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);


const asyncHandler = require('express-async-handler');
app.get('/users', asyncHandler(async (req, res, next) => {
    const users = await getUsersFromDB(); // Example async function
    res.json(users);
}));



app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start the server on port 8081
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
