import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, UserCircle, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function NavBar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsMenuOpen(false);
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (!userProfile) return '/';
    if (userProfile.role === 'admin') return '/admin';
    if (userProfile.role === 'worker') return '/worker/profile';
    return '/employer/profile';
  };

  const getDashboardText = () => {
    return 'Profile';
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-500">
              <Shield className="w-8 h-8 text-yellow-500" />
              <span>Workers Guild</span>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search for workers (e.g. plumber, cleaner)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-2 border border-zinc-800 bg-zinc-900 text-zinc-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-zinc-500"
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1 bottom-1 px-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {!currentUser ? (
              <>
                <Link to="/signup?role=worker" className="text-sm font-medium text-zinc-300 hover:text-yellow-400 transition-colors">
                  Become a Worker
                </Link>
                <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-yellow-400 transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/signup?role=customer" 
                  className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-full shadow-sm hover:bg-yellow-600 hover:-translate-y-0.5 transition-all"
                >
                  Request a Worker
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to={getDashboardLink()} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-zinc-700" />
                  ) : (
                    <UserCircle className="w-6 h-6 text-zinc-400" />
                  )}
                  {getDashboardText()}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button wrapper */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-zinc-400 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500 rounded-md p-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-900 pb-4 pt-2">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {!currentUser ? (
                <>
                  <Link 
                    to="/signup?role=worker" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-yellow-400 rounded-md"
                  >
                    Become a Worker
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-yellow-400 rounded-md"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup?role=customer" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-zinc-900 bg-yellow-500 hover:bg-yellow-400 rounded-md text-center mt-4"
                  >
                    Request a Worker
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-md flex items-center gap-3"
                  >
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-zinc-700" />
                    ) : (
                      <UserCircle className="w-6 h-6 text-zinc-400" />
                    )}
                    {getDashboardText()}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-zinc-500 hover:bg-zinc-900 hover:text-red-500 rounded-md flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Mobile Search Bar - Shows only on small screens */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch} className="w-full relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-zinc-800 bg-zinc-900 text-zinc-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-zinc-500"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-zinc-500" />
            </div>
            <button 
              type="submit" 
              className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform"
            >
              Search
            </button>
          </form>
        </div>

      </div>
    </nav>
  );
}
