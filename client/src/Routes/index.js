import HomePage from "../pages/HomePage/HomePage"
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage"
import OrderPage from "../pages/OrderPage/OrderPage"
import ProductPage from "../pages/productPage/ProductPage"
import ProductDetail from "../pages/ProductDetails/ProductDetail"
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage"
import SignInPage from "../pages/SignInPage/SignInPage"
import SignUpPage from "../pages/SignUpPage/SignUpPage"
import SearchPage from "../pages/search/SearchPage"
import ProfilePage from "../pages/profile/profilePage"
export const routes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
  },
  {
    path: "/order/:id",
    page: OrderPage,
    isShowHeader: true,
  },
  {
    path: "/products",
    page: ProductPage,
    isShowHeader: true,
  },
  {
    path: "/products/:id",
    page: ProductDetail,
    isShowHeader: true,
  },

  {
    path: "/category/:category",
    page: TypeProductPage,
    isShowHeader: true,
  },
  {
    path: "/search/:query",
    page: SearchPage,
    isShowHeader: true,
  },
  {
    path: "/signup",
    page: SignUpPage,
    isShowHeader: false,
  },
  {
    path: "/signin",
    page: SignInPage,
    isShowHeader: false,
  },
  {
    path: "/profile",
    page: ProfilePage,
    isShowHeader: true,
  },
  {
    path: "/*",
    page: NotFoundPage,
    isShowHeader: false,
  },
];