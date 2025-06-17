import HomePage from "../pages/HomePage/HomePage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import OrderPage from "../pages/OrderPage/OrderPage";
import ProductPage from "../pages/productPage/ProductPage";
import ProductDetail from "../pages/ProductDetails/ProductDetail";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import SearchPage from "../pages/search/SearchPage";
import ProfilePage from "../pages/profile/profilePage";
import AdminPage from "../pages/AdminPage/AdminPage";
import CartPage from "../pages/cartPage/cartPage";
export const routes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/order/:id",
    page: OrderPage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/products",
    page: ProductPage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/products/:id",
    page: ProductDetail,
    isShowHeader: true,
    isPrivate: false,
  },

  {
    path: "/category/:category",
    page: TypeProductPage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/search/:query",
    page: SearchPage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/signup",
    page: SignUpPage,
    isShowHeader: false,
    isPrivate: false,
  },
  {
    path: "/signin",
    page: SignInPage,
    isShowHeader: false,
    isPrivate: false,
  },
  {
    path: "/profile",
    page: ProfilePage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/system/admin",
    page: AdminPage,
    isShowHeader: true,
    isPrivate: true,
  },
  {
    path: "/cart",
    page: CartPage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "/*",
    page: NotFoundPage,
    isShowHeader: true,
    isPrivate: false,
  },
];
