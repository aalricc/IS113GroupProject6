const express = require('express');
const router = express.Router();
const adminController = require('.././controllers/admin-controller');
const authMiddleware = require(".././middleware/auth-middleware");

router.get("/admin-page", authMiddleware.checkIfLogged, authMiddleware.checkIfAdmin, adminController.showAdminPage);


module.exports = router;