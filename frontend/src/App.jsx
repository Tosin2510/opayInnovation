import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Validator from './components/Validator/Validator'
import HowItWorks from './components/HowItWorks/HowItWorks'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div className="app">
      <a href="#validator" className="skip-link">
        Skip to Validator
      </a>
      <Navbar />
      <main className="app-content">
        <Hero />
        <hr className="section-divider" />
        <Validator />
        <hr className="section-divider" />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

export default App
