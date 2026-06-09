import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

/**
 * AdminPage — wrapper that gates the dashboard behind a login.
 */
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem('msgshield_admin'));
      return data?.authenticated === true;
    } catch {
      return false;
    }
  });

  const handleAuthenticated = () => setIsAuthenticated(true);

  const handleLogout = () => {
    sessionStorage.removeItem('msgshield_admin');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={handleAuthenticated} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
