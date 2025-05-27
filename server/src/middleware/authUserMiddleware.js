const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const authUserMiddleware = (req, res, next) => {
    try {
        const token = req.headers.token && req.headers.token.split(' ')[1];
        if (!token) {

            return res.status(401).json({ status: 'Error', message: 'No token provided' });
            
        }
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(403).json({ status: 'Error', message: 'Token is invalid' });
            }
            if(user.isAdmin||user.id==req.params.id){

                req.user = user;
                next();
            }
            else{

                return res.status(403).json({ status: 'Error', message: 'The authentication' });

            }
            
        });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: 'Server error:', error});
       
    }
};
module.exports = authUserMiddleware;