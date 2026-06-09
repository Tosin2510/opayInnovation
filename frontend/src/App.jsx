import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Validator from './components/Validator/Validator'
import HowItWorks from './components/HowItWorks/HowItWorks'
import Footer from './components/Footer/Footer'
import SignupModal from './components/SignupModal/SignupModal'
import LoginModal from './components/LoginModal/LoginModal'
import AdminPage from './pages/Admin/AdminPage'
import ValidatorPage from './pages/Validator/ValidatorPage'
import CustomerRoute from './components/CustomerRoute/CustomerRoute'

function LandingPage() {
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const openSignup = () => setIsSignupOpen(true)
  const closeSignup = () => setIsSignupOpen(false)
  
  const openLogin = () => setIsLoginOpen(true)
  const closeLogin = () => setIsLoginOpen(false)

  return (
    <div className="app">
      <a href="#validator" className="skip-link">
        Skip to Validator
      </a>
      <Navbar onSignupClick={openSignup} onLoginClick={openLogin} isAuth={false} />
      <main className="app-content">
        <Hero onSignupClick={openSignup} onLoginClick={openLogin} isAuth={false} />
        <hr className="section-divider" />
        <HowItWorks />
      </main>
      <Footer />

      <SignupModal isOpen={isSignupOpen} onClose={closeSignup} />
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/validator" element={
          <CustomerRoute>
            <ValidatorPage />
          </CustomerRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
