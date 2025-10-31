const express = require('express');
const OpcionController = require('../controllers/opcionController');
const router = express.Router();

router.get('/', OpcionController.getAll);
router.get('/:id', OpcionController.getById);
router.post('/', OpcionController.create);
router.put('/:id', OpcionController.update);
router.delete('/:id', OpcionController.delete);

module.exports = router;