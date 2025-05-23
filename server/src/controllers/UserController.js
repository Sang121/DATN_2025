const UserService = require('../services/UserService');


const createUser = async (req, res) => {
    try {
        const {name, email, password,address, confirmPassword, phone}=req.body;
        const reg=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const isCheckEmail=reg.test(email);
if(!name || !email || !password ||!address|| !confirmPassword || !phone){
    return res.status(200).json({
        status: 'Err',
        message:'the input is required'
    })
}else if(isCheckEmail===false){
    return res.status(200).json({
        status:'Err',
        message:'The input must be email format'
    })
}
else if(password!==confirmPassword){
    return res.status(200).json({
        status:'200',
        message:'Password must be equal confirm password'
      })}
       const response= await UserService.createUser(req.body);
        return res.status(201).json(response); 
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}
const loginUser = async (req, res) => {
    try {
        const { email, password}=req.body;
        const reg=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const isCheckEmail=reg.test(email);
if(!email || !password){
    return res.status(200).json({
        status: 'Err',
        message:'the input is required'
    })
}else if(isCheckEmail===false){
    return res.status(200).json({
        status:'Err',
        message:'The input must be email format'
    })
}
       const response= await UserService.loginUser(req.body);
        return res.status(201).json(response); 
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}
const updateUser = async (req, res) => {
    try {
        const userId=req.params.id
        const data= req.body;
        if(!userId){
            return res.status(200).json({
                status: 'Err',
                message:'the userId is required'
            })
        }
        console.log('data',data)
        console.log('userId',userId)
         
       const response= await UserService.updateUser(userId,data );
        return res.status(200).json(response); 
    }
    catch (error) {
        return res.status(404).json({ message: 'Server error', error });
    }
}
const deleteUser = async (req, res) => {
    try {
        const userId=req.params.id
        if(!userId){
            return res.status(200).json({
                status: 'Err',
                message:'the userId is required'
            })
        }
        
       const response= await UserService.deleteUser(userId);
        return res.status(200).json(response); 
    }
    catch (error) {
        return res.status(404).json({ message: 'Server error', error });
    }
}
const getAllUser = async (req, res) => {
    try {
        const response= await UserService.getAllUser();
        return res.status(200).json(response); 
    }
    catch (error) {
        return res.status(404).json({ message: 'Server error', error });
    }
}
const getDetailUser = async (req, res) => {
    try {
        const userId=req.params.id
        if(!userId){
            return res.status(200).json({
                status: 'Err',
                message:'the userId is required'
            })
        }
        
       const response= await UserService.getDetailUser(userId);
        return res.status(200).json(response); 
    }
    catch (error) {
        return res.status(404).json({ message: 'Server errorr', error });
    }
}
const refreshToken = async (req, res) => {
    try {
        const token=req.headers.token.split(' ')[1];
        if(!token){
            return res.status(200).json({
                status: 'Err',
                message:'the token is required'
            })
        }
       const response= await UserService.refreshToken(token);
        return res.status(200).json(response); 
    }
     
    catch (error) {
        return res.status(404).json({ message: 'Error when get refresh token', error });
    }
}
 module.exports = { createUser,loginUser,updateUser,deleteUser,getAllUser,getDetailUser,refreshToken };
