const express = require('express')
const router = express.Router();

const route = require('../controllers/LOGcontrols');

router.get('/login',route.getlogin);
router.get('/register',route.getregister);
router.post('/login',route.postlogin);
router.post('/register',route.postregister);

module.exports = router;