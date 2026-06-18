import { Menu, Search, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import useAuth from '../../hooks/useAuth';
import ChangePasswordModal from '../upload/ChangePasswordModal';
import { useQueryClient } from '@tanstack/react-query';

const Header = ({ onMenuClick, onUploadClick }) => {

  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-3 md:px-4 gap-3">
      {/* Left — menu + logo */}
      <div className="flex items-center gap-2 md:gap-4 min-w-fit">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors hidden md:flex"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-1.5">
          <span className="hidden sm:block text-lg font-semibold tracking-[0.2em] text-red-500 glitch-logo">
            NEXIS
          </span>
        </Link>
      </div>

      {/* Center — search bar (desktop) */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex flex-1 max-w-xl items-center"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-l-full px-4 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 border-l-0 rounded-r-full px-4 py-2 transition-colors"
        >
          <Search size={20} className="text-zinc-300" />
        </button>
      </form>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="absolute inset-0 bg-zinc-950 flex items-center px-3 gap-2 z-10 md:hidden">
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-2"
          >
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-full px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="text-zinc-300">
              <Search size={20} />
            </button>
          </form>
          <button
            onClick={() => setShowSearch(false)}
            className="text-zinc-400 ml-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-1.5 md:gap-4 min-w-fit">
        {/* Search icon — mobile only */}
        <button
          onClick={() => setShowSearch(true)}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors md:hidden"
        >
          <Search size={20} />
        </button>

        {/* Upload — desktop only (mobile uses BottomNav) */}
        <button
          onClick={onUploadClick}
          className="hidden md:flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-3 py-1.5 rounded-full transition-colors"
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="dropdown-animate absolute right-0 top-10 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-white text-sm font-medium truncate">
                  {user?.fullName}
                </p>
                <p className="text-zinc-500 text-xs truncate">
                  @{user?.username}
                </p>
              </div>
              <div className="py-1">
                <Link
                  to={`/channel/${user?.username}`}
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Your Channel
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div
                  onClick={() => {
                    setShowDropdown(false);
                    setChangePasswordModalOpen(true);
                  }}
                  className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Change password
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    queryClient.clear();
                    logOut();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </header>
  );
};

export default Header;