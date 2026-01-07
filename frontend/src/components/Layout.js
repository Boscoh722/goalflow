import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Target, 
  BarChart3, 
  Users, 
  User,
  LogOut,
  Menu,
  X 
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/goals', icon: <Target size={20} />, label: 'Goals' },
    { path: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/partners', icon: <Users size={20} />, label: 'Partners' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <nav className="glass-card sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                GoalFlow
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* User Score */}
              <div className="ml-6 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full">
                <span className="font-bold text-primary-700">{user?.score || 0} pts</span>
              </div>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card border-t">
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                <div className="p-3">
                  <div className="font-bold text-primary-700">
                    Score: {user?.score || 0} pts
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
<footer className="glass-card border-t mt-12">
  <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      
      {/* App Branding */}
      <div className="flex items-center space-x-3">
        <Target className="text-primary-600" size={24} />
        <span className="text-xl font-heading font-bold">GoalFlow</span>
      </div>

      {/* Footer Text */}
      <div className="text-center md:text-right space-y-1">
        <p className="text-gray-600">
          Track your progress, achieve your dreams.
        </p>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} GoalFlow
        </p>

        {/* Contact Developer */}
        <p className="text-sm text-gray-500">
          Contact Developer:{' '}
          <a
            href="https://boscohportfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
          >
            Bosco Brilliant
          </a>
        </p>
      </div>

    </div>
  </div>
</footer>

    </div>
  );
};

export default Layout;
