const productService = require('../services/productService');

const createProduct = async (req, res) => {
    try {
        const {name, category, gender,price, discount, images,stock,description,attributes,size,color,brand}=req.body;
        console.log('product',req.body)
      
        
    
    
//         const reg=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//         const isCheckEmail=reg.test(email);
if(!name || !category || !gender || !price || !discount || !images || !stock || !description || !attributes){
    return res.status(200).json({
        status: 'Err',
        message:'The input is required'
    })

}
const response=await productService.createProduct(req.body)
return res.status(200).json({response,
    message:'Create product success'})

}
    catch (error) {
        return res.status(500).json({ message: 'Error creating product', error });
    }
}
const updateProduct = async (req, res) => {
    try {
        const productId=req.params.id
        const data= req.body;
        console.log('product',)
        if(!productId){
            return res.status(200).json({
                status: 'Err',
                message:'the productId is required'
            })
        }
       const response= await productService.updateProduct(productId,data );
        return res.status(200).json(
            response
        ); 
    }
    catch (error) {
        return res.status(404).json({ message: 'Server error when update product', error });
    }
}
const getDetailProduct = async (req, res) => {
    try {
        const productId=req.params.id
        if(!productId){
            return res.status(200).json({
                status: 'Err',
                message:'the productId is required'
            })
        }
        
       const response= await productService.getDetailProduct(productId);
        return res.status(200).json(response); 
    }
    catch (error) {
        return res.status(404).json({ message: 'Server error', error });
    }
}
const deleteProduct = async (req, res) => {
    try {
        const productId=req.params.id
        if(!productId){
            return res.status(200).json({
                status: 'Err',
                message:'the productId is required'
            })
        }
        
       const response= await productService.deleteProduct(productId);
        return res.status(200).json({response,
            message :'Delete product success'}
        ); 
    }
    catch (error) {
        return res.status(404).json({ message: 'Server error', error });
    }
}
const getAllProduct = async (req, res) => {
    try {
        let { limit, page, sort, filter, q } = req.query;
        limit = limit ? Number(limit) : 8;
        page = page ? Number(page) : 1;

        const response = await productService.getAllProduct(limit, page, sort, filter, q);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({ message: 'Server error', error });
    }
};
// const getProductByCategory = async (req, res) => {
//     const category=req.params.category
//     try {
//         const response= await productService.getProductByCategory(category);
//         return res.status(200).json(response); 
//     }
//     catch (error) {
//         return res.status(404).json({ message: 'Server error', error });
//     }
// }
// const searchProduct = async (req, res) => {
//     const query=req.params.query
//     try {
//         const response= await productService.searchProduct(query);
//         return res.status(200).json(response); 
//     }
//     catch (error) {
//         return res.status(404).json({ message: 'Server error', error });
//     }
// }



 module.exports = {createProduct, updateProduct,getDetailProduct,deleteProduct,getAllProduct };
