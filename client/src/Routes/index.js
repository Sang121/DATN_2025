import HomePage from "../pages/HomePage/HomePage"
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage"
import OrderPage from "../pages/OrderPage/OrderPage"
import ProductPage from "../pages/productPage/ProductPage"
export const routes= [
  { 
    path: '/',
    page: HomePage,
    isShowHeader: true
  },
  { 
    path: '/order/:id',
    page: OrderPage,
        isShowHeader: true

  },
  { 
    path: '/products',
    page: ProductPage,
        isShowHeader: true
 
  },
  {
    path:'/*',
    page:NotFoundPage,
    isShowHeader:false
  }
]