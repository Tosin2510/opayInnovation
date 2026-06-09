import { Navigate } from 'react-router-dom';

export default function CustomerRoute({ children }) {
  const sessionData = sessionStorage.getItem('msgshield_customer');
  let isAuth = false;

  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      isAuth = parsed.authenticated === true;
    } catch {
      isAuth = false;
    }
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}
