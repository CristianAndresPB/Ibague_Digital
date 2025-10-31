const express = require('express');
const AdminController = require('../controllers/adminController');
const router = express.Router();

router.post('/login', AdminController.login);
router.post('/', AdminController.create);

module.exports = router;