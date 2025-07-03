import { lazy } from "react";

const HomePage = lazy(() => import("../pages/HomePage/HomePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage/NotFoundPage"));
const ProductDetail = lazy(() =>
  import("../pages/ProductDetails/ProductDetail")
);
const TypeProductPage = lazy(() =>
  import("../pages/TypeProductPage/TypeProductPage")
);
const SignInPage = lazy(() => import("../pages/SignInPage/SignInPage"));
const SignUpPage = lazy(() => import("../pages/SignUpPage/SignUpPage"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));
const ProfilePage = lazy(() => import("../pages/profile/profilePage"));
const AdminPage = lazy(() => import("../pages/AdminPage/AdminPage"));
const CartPage = lazy(() => import("../pages/CartPage/CartPage"));
const PaymentPage = lazy(() => import("../pages/PaymentPage/PaymentPage"));
const PaymentSuccessPage = lazy(() =>
  import("../pages/PaymentSuccessPage/PaymentSuccessPage")
);
const PaymentFailedPage = lazy(() =>
  import("../pages/PaymentFailedPage/PaymentFailedPage")
);
const OrderDetailPage = lazy(() =>
  import("../pages/OrderDetailPage/OrderDetailPage")
);
const MyOrdersPage = lazy(() => import("../components/myOrder/MyOrder"));
const AdminOrderDetail = lazy(() =>
  import("../pages/AdminPage/component/adminOrderDetail/AdminOrderDetail")
);

export const routes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
    isPrivate: false,
  },
  // {
  //   path: "/order/:id",
  //   page: OrderPage,
  //   isShowHeader: true,
  //   isPrivate: false,
  // },

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
    isAuthRequired: true,
  },
  {
    path: "/system/admin",
    page: AdminPage,
    isShowHeader: true,
    isPrivate: true,
  },
  {
    path: "/system/orderDetails/:orderId",
    page: AdminOrderDetail,
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
    path: "/payment",
    page: PaymentPage,
    isShowHeader: true,
    isPrivate: false,
    isAuthRequired: true,
  },
  {
    path: "/payment-success",
    page: PaymentSuccessPage,
    isShowHeader: true,
    isPrivate: false,
    isAuthRequired: true,
  },
  {
    path: "/payment-failed",
    page: PaymentFailedPage,
    isShowHeader: true,
    isPrivate: false,
    isAuthRequired: true,
  },

  {
    path: "/order-details/:orderId",
    page: OrderDetailPage,
    isShowHeader: true,
  },
  {
    path: "/admin/order-details/:orderId",
    page: AdminOrderDetail,
    isShowHeader: true,
    isPrivate: true, // Chỉ admin mới có thể truy cập
  },
  {
    path: "/profile/my-orders",
    page: MyOrdersPage,
    isShowHeader: true,
    isPrivate: false,
  },
  {
    path: "*",
    page: NotFoundPage,
    isShowHeader: false,
    isPrivate: false,
  },
];
