const Product = require('../models/productModel');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const createProduct = (newProduct) => {
    const {name, category, gender,price, discount, images,stock,description,attributes,size,color,brand}=newProduct;

    return new Promise(async (resolve, reject) => {
    
            try{
                const checkProduct= await Product.findOne({
                    name:name,
                })
                if(checkProduct!==null){
                 resolve({
                    status:'Err',
                    message:'Product already exist',
                    data:null
                 })
                }
                const createProduct = await Product.create({
                    name, category, gender,price, discount, images,stock,description,attributes,size,color,brand
                })
                if(createProduct){
                    resolve({
                        status:'Success',
                        message:'Product created successfully',
                        data:createProduct
                    })
                
                }
               
        } catch (error) {
            reject({ message: 'Server error while create user', error });
        }
    });
};
const updateProduct = (id,data) => {
    return new Promise(async (resolve, reject) => {          
            try{
                const existingProduct = await Product.findById(id)
         if(!existingProduct){
            resolve({
                    status: 'Ok',
                    message: 'Product not found',
                    data: null
                })
         }
           const updateProduct=await Product.findByIdAndUpdate(id,data,{new:true})
                    resolve({ status:'Ok', message: 'Success',data:updateProduct });
                // }else{
                //     reject({ message: 'User created Unsuccessfully' });
                // }
    } catch (error) {
            reject({ message: 'Server error while update product', error });
        }
    });
};
const getDetailProduct = (id) => {
    return new Promise(async (resolve, reject) => {          
            try{
                const existingProduct = await Product.findById(id)
         if(!existingProduct){
            resolve({
                    status: 'Ok',
                    message: 'Product not found',
                })
         }
          productDetail=await Product.findById(id)

                    resolve({ status:'Ok', message: 'Get product success',data:productDetail});   
    } catch (error) {
            reject({ message: 'Server error while get product', error });
        }
    });
};
const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {          
            try{
                const existingProduct = await Product.findById(id)
         if(!existingProduct){
            resolve({
                    status: 'Ok',
                    message: 'Product not found',
                })
         }
          await Product.findByIdAndDelete(id)

        
                    resolve({ status:'Ok', message: 'Delete product success'});
                // }else{
                //     reject({ message: 'User created Unsuccessfully' });
                // }
    } catch (error) {
            reject({ message: 'Server error when delete product', error });
        }
    });
};
const getAllProduct = (limit = 8, page = 1, sort, filter, q) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm kiếm theo từ khóa q
            if (q) {
                const totalProductSearch = await Product.find({
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { category: { $regex: q, $options: 'i' } },
                        { gender: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } },
                        { brand: { $regex: q, $options: 'i' } },
                    ],
                });
                return resolve({
                    status: 'Ok',
                    message: totalProductSearch.length ? 'Search product success' : 'Product not found',
                    data: totalProductSearch,
                });
            }

            // Lọc theo category
            if (filter) {
                const totalProduct = await Product.countDocuments({ category: filter });
                const allProduct = await Product.find({ category: filter })
                    .limit(limit)
                    .skip((page - 1) * limit)
                    .sort({ name: sort });
                return resolve({
                    status: 'Ok',
                    message: 'Get all product success',
                    total: totalProduct,
                    pageCurrent: page,
                    totalPage: Math.ceil(totalProduct / limit),
                    data: allProduct,
                });
            }

            // Lấy tất cả sản phẩm (không filter, không search)
            const totalProduct = await Product.countDocuments();
            const allProduct = await Product.find()
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ name: sort });

            resolve({
                status: 'Ok',
                message: 'Get all product success',
                total: totalProduct,
                pageCurrent: page,
                totalPage: Math.ceil(totalProduct / limit),
                data: allProduct,
            });
        } catch (error) {
            reject({ message: 'Server error when get product', error });
        }
    });
};
// const getProductByCategory = (category) => {
//     return new Promise(async (resolve, reject) => {          
//             try{
//                 console.log(category)

//                 const existingCategory= await Product.find({
//                     category:category,
//                 })
//                 console.log(existingCategory)
//          if(!existingCategory){
//             resolve({
//                     status: 'Ok',
//                     message: 'Category not found',
//                 })
//          }
//           const  allProduct= await Product.find({
//             category:category,
//         })
//                     resolve({ status:'Ok', message: 'Get all  product success', data:allProduct});
//     } catch (error) {
//             reject({ message: 'Server error when get get Product By Category', error });
//         }
//     });
// };
// const searchProduct = (query) => {
//     return new Promise(async (resolve, reject) => {          
//             try{
//                  const productSearch= await Product.find({
//                     $or: [
//                         { name: { $regex: query, $options: 'i' } },
//                         { category: { $regex: query, $options: 'i' } },
//                         { gender: { $regex: query, $options: 'i' } },
//                         { description: { $regex: query, $options: 'i' } },
//                         { brand: { $regex: query, $options: 'i' } },
//                     ],
//                 })
//                 console.log(productSearch)
//                 if(!productSearch){
//                     resolve({
//                         status: 'Ok',
//                         message: 'Product not found',
//                     })
//                 }
//                 resolve ({ status:'Ok', message: 'Search product success', data:productSearch}) 
//             }
//             catch (error) {
//             reject({ message: 'Server error when search product', error });
//         }
//     });
// }


module.exports = { createProduct,updateProduct,getDetailProduct,deleteProduct,getAllProduct};