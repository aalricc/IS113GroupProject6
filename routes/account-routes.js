const express = require('express');
const accountController = require(".././controllers/account-controller");
const router = express.Router();

router.get("/account", accountController.showAccountPage);

router.get("/account/update-username", accountController.showUpdateUsernamePage);
router.post("/account/update-username", accountController.updateUsername);

router.get("/account/update-email", accountController.showUpdateEmailPage);
router.post("/account/update-email", accountController.updateEmail);

router.get("/account/change-password", accountController.showChangePasswordPage);
router.post('/account/change-password', accountController.changePassword);

router.get("/account/delete-account", accountController.showDeleteAccountPage);
router.post("/account/delete-account", accountController.deleteAccount);

module.exports = router;