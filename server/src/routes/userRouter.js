const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware= require('../middleware/authMiddleware')


router.post('/signin',userController.loginUser);
router.post('/signup',userController.createUser);
router.put('/update-user/:id',userController.updateUser);
router.get('/delete-user/:id',authMiddleware,userController.deleteUser);
router.get('/getAllUser',authMiddleware,userController.getAllUser);
router.get('/getDetailUser/:id',userController.getDetailUser);

module.exports = router;

