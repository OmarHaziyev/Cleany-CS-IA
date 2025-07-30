import React from 'react'
import LandingPage from './pages/LandingPage.jsx';
import {Route, Routes} from "react-router";
import Login from './pages/LoginPage.jsx';
import CleanerSignup from './pages/CleanerSignup.jsx';

const App = () => {
  return (
    <div>

      <Routes>
              
        <Route path="/" element={<LandingPage/>} />
        <Route path="/cleaner/login" element={<Login/>}/>
        <Route path="/client/login" element={<Login/>}/>
        <Route path="/cleaner/signup" element= {<CleanerSignup/>}/>
        
      
      </Routes>

    </div>
  )
}

export default App
