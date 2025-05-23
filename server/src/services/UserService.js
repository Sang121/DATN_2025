const User = require('../models/userModel');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {genneralRefreshToken,genneralAccessToken} = require('./jwtService');
//const genneralRefreshToken = require('./jwtService');
const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
    
            const { name, email,address, password,confirmPassword, phone } = newUser;
            
            try{
                const existingUser = await User.findOne({ email: newUser.email });
            if (existingUser) {
                return reject({ message: 'Email đã tồn tại!' });
            }
            const hashedPassword = await bcrypt.hashSync(password, 10);
            const confirmHashedPassword = await bcrypt.hashSync(confirmPassword, 10);
            console.log( hashedPassword)
                const createUser=await User.create({
                    name,
                    email,
                    address,
                    password: hashedPassword,
                    confirmPassword: confirmHashedPassword,
                    phone,
                })
                if(createUser){
                    resolve({ status:'Ok', message: 'User created successfully', data: createUser });
                }else{
                    reject({ message: 'User created Unsuccessfully' });
                }
        } catch (error) {
            reject({ message: 'Server error while create user', error });
        }
    });
};
const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
    
            const {  email, password} = userLogin;
            
            try{
                const existingUser = await User.findOne({ email: email });
            if (existingUser === null) {
                resolve({status:'Ok', message: 'Email không tồn tại!' });
            }
            const comparePassword=bcrypt.compareSync(password, existingUser.password);
            if(!comparePassword){
                return reject({status:'Ok', message: 'Mật khẩu không đúng!' });
            }

         

           const access_token=await genneralAccessToken({
            id:existingUser._id,
            isAdmin:existingUser.isAdmin,
            // name:existingUser.name,
            // email:existingUser.email,
            // phone:existingUser.phone
           })
           const refresh_token= await genneralRefreshToken({
            id:existingUser._id,
            isAdmin:existingUser.isAdmin,
        })
        
                    resolve({ status:'Ok', message: 'Success', access_token, refresh_token });
                // }else{
                //     reject({ message: 'User created Unsuccessfully' });
                // }
    } catch (error) {
            reject({ message: 'Server error while create user', error });
        }
    });
};
const updateUser = (id,data) => {
    return new Promise(async (resolve, reject) => {          
            try{
                const existingUser = await User.findById(id)
         if(!existingUser){
            resolve({
                    status: 'Ok',
                    message: 'User not found',
                })
         }
            
            
           const updateUser=await User.findByIdAndUpdate(id,data,{new:true})
           console.log(updateUser)

        
                    resolve({ status:'Ok', message: 'Success',data:updateUser });
                // }else{
                //     reject({ message: 'User created Unsuccessfully' });
                // }
    } catch (error) {
            reject({ message: 'Server error while create user', error });
        }
    });
};
const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {          
            try{
                const existingUser = await User.findById(id)
         if(!existingUser){
            resolve({
                    status: 'Ok',
                    message: 'User not found',
                })
         }
          await User.findByIdAndDelete(id)

        
                    resolve({ status:'Ok', message: 'Delete user success'});
                // }else{
                //     reject({ message: 'User created Unsuccessfully' });
                // }
    } catch (error) {
            reject({ message: 'Server error while delete user', error });
        }
    });
};
const getAllUser = () => {
    return new Promise(async (resolve, reject) => {          
            try{
        
          const allUser= await User.find() 
                    resolve({ status:'Ok', message: 'Get all  user success',data:allUser});
                // }else{
                //     reject({ message: 'User created Unsuccessfully' });
                // }
    } catch (error) {
            reject({ message: 'Server error while get user', error });
        }
    });
};
const getDetailUser = (id) => {
    return new Promise(async (resolve, reject) => {          
            try{
                const existingUser = await User.findById(id)
         if(!existingUser){
            resolve({
                    status: 'Ok',
                    message: 'User not found',
                })
         }
          userDetail=await User.findById(id)

        
                    resolve({ status:'Ok', message: 'Get user success',data:userDetail});
                // }else{
                //     reject({ message: 'User created Unsuccessfully' });
                // }
    } catch (error) {
            reject({ message: 'Server error while get user', error });
        }
    });
};
const refreshToken = (token) => {
    return new Promise(async (resolve, reject) => {          
            try{

          jwt.verify(token,process.env.REFRESH_TOKEN, async (err,user)=>{
            if(err){
                resolve({

                status: 'Err',
                status:'The authentication'
                })
                }
            const {payload}=user
            const access_token= await genneralAccessToken({
                id:payload?.id,
                isAdmin:payload?.isAdmin
            })
           
        
        
                    resolve({ status:'Ok', message: 'Refresh token success',access_token});
                })
                
    } catch (error) {
            reject({ message: 'Server error while get user', error });
        }
    });
};
module.exports = { createUser, loginUser,updateUser,deleteUser,getAllUser,getDetailUser,refreshToken};