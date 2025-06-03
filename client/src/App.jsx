import React, { Fragment } from "react";
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
        <Routes>
          {routes.map((route, index) => {
            const Page = route.page;
            const checkAuth = !route.isPrivate || user.isAdmin;
            const Layout = route.isShowHeader ? DefauPage : Fragment;

            return (
              route.path &&
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
      </Router>
    </div>
  );
}
export default App;
