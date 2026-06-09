import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Validator from '../../components/Validator/Validator';
import Footer from '../../components/Footer/Footer';
import './ValidatorPage.css';

export default function ValidatorPage() {
  const navigate = useNavigate();
  
  // Read session context
  const sessionData = JSON.parse(sessionStorage.getItem('msgshield_customer') || '{}');
  const username = sessionData.username || sessionData.email || 'Customer';

  const handleLogout = () => {
    sessionStorage.removeItem('msgshield_customer');
    navigate('/');
  };

  return (
    <div className="app">
      <Navbar isAuth={true} onLogout={handleLogout} />
      <main className="app-content validator-page__content">
        <div className="validator-page__header">
          <h1 className="validator-page__title">Welcome, <span className="validator-page__username">{username}</span></h1>
          <p className="validator-page__desc">Use the tool below to verify any bank messages you've received.</p>
        </div>
        <Validator />
      </main>
      <Footer />
    </div>
  );
}
