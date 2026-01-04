import React from 'react'
import Navabr from './component/component_lite/Navabr'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from "./component/authcomponent/Login";
import Register from "./component/authcomponent/Register";
import Home from './component/component_lite/Home';

const App = () => {
  return (
    <>
      <BrowserRouter>
      <Navabr/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App