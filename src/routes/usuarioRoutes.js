const express = require('express');
const UsuarioController = require('../controllers/usuarioController');
const router = express.Router();

router.get('/', UsuarioController.getAll);
router.get('/:id', UsuarioController.getById);
router.post('/', UsuarioController.create);
router.put('/:id', UsuarioController.update);
router.delete('/:id', UsuarioController.delete);

module.exports = router;