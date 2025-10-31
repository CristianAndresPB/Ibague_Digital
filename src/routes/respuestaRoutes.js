const express = require('express');
const RespuestaController = require('../controllers/respuestaController');
const router = express.Router();

router.get('/', RespuestaController.getAll);
router.get('/:id', RespuestaController.getById);
router.post('/', RespuestaController.create);
router.put('/:id', RespuestaController.update);
router.delete('/:id', RespuestaController.delete);

module.exports = router;