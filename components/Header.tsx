
import React from 'react';
import { UserRole } from '../types';
import { Bell, Search, Calendar as CalendarIcon, LogOut } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentRole, searchTerm, setSearchTerm, onLogout }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{currentRole} Portal</h1>
        <div className="flex items-center text-slate-500 text-sm mt-1">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {today}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Global search..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-64 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative" onClick={() => alert('Notifications coming soon!')}>
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
