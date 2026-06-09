import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Validator from './components/Validator/Validator'
import HowItWorks from './components/HowItWorks/HowItWorks'
import Footer from './components/Footer/Footer'
import SignupModal from './components/SignupModal/SignupModal'
import AdminPage from './pages/Admin/AdminPage'

function LandingPage() {
  const [isSignupOpen, setIsSignupOpen] = useState(false)

  const openSignup = () => setIsSignupOpen(true)
  const closeSignup = () => setIsSignupOpen(false)

  return (
    <div className="app">
      <a href="#validator" className="skip-link">
        Skip to Validator
      </a>
      <Navbar onSignupClick={openSignup} />
      <main className="app-content">
        <Hero onSignupClick={openSignup} />
        <hr className="section-divider" />
        <Validator />
        <hr className="section-divider" />
        <HowItWorks />
      </main>
      <Footer />

      <SignupModal isOpen={isSignupOpen} onClose={closeSignup} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
