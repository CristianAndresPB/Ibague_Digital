const express = require('express');
const EncuestaController = require('../controllers/encuestaController');
const router = express.Router();

router.get('/', EncuestaController.getAll);
router.get('/:id', EncuestaController.getById);
router.post('/', EncuestaController.create);
router.put('/:id', EncuestaController.update);
router.delete('/:id', EncuestaController.delete);

module.exports = router;