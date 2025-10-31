const express = require('express');
const PreguntaController = require('../controllers/preguntaController');
const router = express.Router();

router.get('/', PreguntaController.getAll);
router.get('/:id', PreguntaController.getById);
router.post('/', PreguntaController.create);
router.put('/:id', PreguntaController.update);
router.delete('/:id', PreguntaController.delete);

module.exports = router;