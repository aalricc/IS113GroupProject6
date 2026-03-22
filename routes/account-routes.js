const express = require('express');
const accountController = require(".././controllers/account-controller");
const router = express.Router();

router.get("/account", accountController.showAccountPage);

module.exports = router;