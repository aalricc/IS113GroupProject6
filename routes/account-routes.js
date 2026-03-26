const express = require('express');
const accountController = require(".././controllers/account-controller");
const authMiddleware = require(".././middleware/auth-middleware");
const router = express.Router();

router.get("/account", authMiddleware.checkIfLogged, accountController.showAccountPage);

router.get("/account/update-username", authMiddleware.checkIfLogged, accountController.showUpdateUsernamePage);
router.post("/account/update-username", authMiddleware.checkIfLogged, accountController.updateUsername);

router.get("/account/update-email", authMiddleware.checkIfLogged, accountController.showUpdateEmailPage);
router.post("/account/update-email", authMiddleware.checkIfLogged, accountController.updateEmail);

router.get("/account/change-password", authMiddleware.checkIfLogged, accountController.showChangePasswordPage);
router.post('/account/change-password', authMiddleware.checkIfLogged, accountController.changePassword);

router.get("/account/delete-account", authMiddleware.checkIfLogged, accountController.showDeleteAccountPage);
router.post("/account/delete-account", authMiddleware.checkIfLogged, accountController.deleteAccount);

module.exports = router;