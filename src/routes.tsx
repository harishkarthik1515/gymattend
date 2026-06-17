import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Home } from '@/pages/home';
import { AdminDashboard } from '@/pages/admin/dashboard';
import { MemberAttendance } from '@/pages/attendance';
import { Settings } from '@/pages/admin/settings';
import { Login } from '@/pages/admin/login';

export function Routes() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'admin' && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'admin':
        return isAuthenticated ? (
          <AdminDashboard onNavigate={handleNavigate} />
        ) : (
          <Login onNavigate={handleNavigate} onLogin={() => setCurrentPage('admin')} />
        );
      case 'login':
        return <Login onNavigate={handleNavigate} onLogin={() => setCurrentPage('admin')} />;
      case 'attendance':
        return <MemberAttendance onNavigate={handleNavigate} />;
      case 'settings':
        return isAuthenticated ? (
          <Settings onNavigate={handleNavigate} />
        ) : (
          <Login onNavigate={handleNavigate} onLogin={() => setCurrentPage('settings')} />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return renderPage();
}