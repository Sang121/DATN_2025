const Mongoose = require('mongoose');
require('dotenv').config();
console.log('Connecting to MongoDB...');
console.log('MongoDB URL:', process.env.MONGODB_URL);
const connectDB = async () => {
    try {
        await Mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};

module.exports = connectDB;
