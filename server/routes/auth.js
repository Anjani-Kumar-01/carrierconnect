const express = require("express");
const router = express.Router();
const {sendOtp,signUp,login} = require("../controller/auth");

router.post("/sendotp",sendOtp);
router.post("/signUp", signUp);
router.post("/login", login);


module.exports = router;
