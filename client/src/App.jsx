import React, { Fragment } from 'react'
import { Button, Flex } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { routes } from './Routes/index.js'
import Header from './components/Header/Header.jsx';
import DefauPage from './pages/DefautPage/DefauPage.jsx';

 function App() {
  
  return (
    <div>
     
      <Router>
        <Routes>
          {routes.map((route, index) => {
           const Page= route.page
           const Layout=route.isShowHeader ? DefauPage: Fragment
           return (
            <Route key={index} path={route.path} element={
            <Layout>
            <Page/>
             </Layout>
          } />
          )
 })}
        </Routes>
      </Router>

      
      </div>
    
  )
}
export default App