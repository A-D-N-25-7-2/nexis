import { Link, useLocation } from 'react-router-dom';
import { Home, PlaySquare, ThumbsUp, History, Upload, Search } from 'lucide-react';

const BottomNav = ({ onUploadClick }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: PlaySquare, label: 'Subs', path: '/subscriptions' },
    { icon: Upload, label: 'Upload', path: null, action: onUploadClick },
    { icon: ThumbsUp, label: 'Liked', path: '/liked-videos' },
    { icon: History, label: 'History', path: '/history' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around px-2 py-2">
      {navItems.map(({ icon: Icon, label, path, action }) => {
        const isActive = path && location.pathname === path;

        if (action) {
          return (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <div className="bg-red-600 rounded-full p-2">
                <Icon size={18} className="text-white" />
              </div>
            </button>
          );
        }

        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors
              ${isActive ? 'text-white' : 'text-zinc-500'}`}
          >
            <Icon size={20} className={isActive ? 'text-white' : ''} />
            <span className="text-xs">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;