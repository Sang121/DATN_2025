import React, { Fragment, Suspense } from "react";
import { Button, Flex } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./Routes/index.js";
import Header from "./components/Header/Header.jsx";
import DefauPage from "./pages/DefautPage/DefauPage.jsx";
import { useSelector } from "react-redux";

function App() {
  const user = useSelector((state) => state.user);
  return (
    <div>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {routes.map((route, index) => {
              const Page = route.page;
              const checkAuth = !route.isPrivate || user.isAdmin;
              const isLogin = !route.isAuthRequired || user.access_token;
              const Layout = route.isShowHeader ? DefauPage : Fragment;

              return (
                route.path &&
                isLogin &&
                checkAuth && (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <Layout>
                        <Page />
                      </Layout>
                    }
                  />
                )
              );
            })}
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}
export default App;
