import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./components/Home/Home"
import Login from "./components/Login/Login"
import Signup from "./components/Signup/Signup"
import Dashboard from "./components/Dashboard/Dashboard"
import Products from "./components/Products/Products"
import Stock from "./components/Stock/Stock"
import Movements from "./components/Movements/Movements"
import PrivateRoute from './components/ProtectedRoute'
import { AuthProvider } from './AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
          <Route path="/movements" element={<PrivateRoute><Movements /></PrivateRoute>} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
