const UserService = require('../services/UserService');


const createUser = async (req, res) => {
    try {
        console.log(req.body);
       const result= await UserService.createUser(req.body);
        return res.status(201).json(result); 
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}

 module.exports = { createUser };
