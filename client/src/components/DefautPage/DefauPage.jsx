import React from 'react'
import Header from '../Header/Header'

const DefauPage = ({ children }) =>{
  return (
    <div>
<Header />
{children}

    </div>
  )
}

export default DefauPage