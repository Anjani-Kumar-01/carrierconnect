const express = require('express');
const { login, signUp, changePassword, getProfile } = require('../controller/auth');
const router = express.Router();

// Auth routes
router.post('/signup', signUp);          
router.post('/login', login);               
router.put('/changepassword', changePassword); 
router.get('/getprofile', getProfile);      
module.exports = router;

