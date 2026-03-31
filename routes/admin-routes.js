const express = require('express');
const router = express.Router();
const adminController = require('.././controllers/admin-controller');
const authMiddleware = require(".././middleware/auth-middleware");

router.get("/admin-page", authMiddleware.checkIfLogged, authMiddleware.checkIfAdmin, adminController.showAdminPage);

router.post("/admin-delete-review/:reviewId",
  authMiddleware.checkIfLogged,
  authMiddleware.checkIfAdmin,
  adminController.deleteReviewAsAdmin
);

router.post("/admin-create-user", authMiddleware.checkIfLogged, authMiddleware.checkIfAdmin, adminController.createUser);

router.post(
    "/admin-delete-user/:id",
    authMiddleware.checkIfLogged,
    authMiddleware.checkIfAdmin,
    adminController.deleteUser
);

router.post(
    "/admin-update-user/:id",
    authMiddleware.checkIfLogged,
    authMiddleware.checkIfAdmin,
    adminController.updateUser
);

module.exports = router;