const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validateUserUpdate } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /user/profile
router.get('/profile', userController.getProfile);

// PUT /user/profile
router.put('/profile', validateUserUpdate, userController.updateProfile);

// DELETE /user/account
router.delete('/account', userController.deleteAccount);

module.exports = router;