const User = require('../models/users.model');

const createUser = (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                return reject({ message: 'Email đã tồn tại!' });
            }
  
            const newUser = new User({
                fullName: userData.name, 
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
            });
            await newUser.save();
            resolve({ message: 'User created successfully', user: newUser });
        } catch (error) {
            reject({ message: 'Server error', error });
        }
    });
};

module.exports = { createUser };