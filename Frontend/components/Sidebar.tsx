
import React from 'react';
import { UserRole } from '../types';
import { 
  Users, 
  Stethoscope, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  Activity,
  Globe
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, onRoleChange }) => {
  const menuItems = [
    { role: UserRole.RECEPTION, icon: Users, label: 'Reception' },
    { role: UserRole.DOCTOR, icon: Stethoscope, label: 'Doctor' },
    { role: UserRole.INSURANCE_MANAGER, icon: ShieldCheck, label: 'Insurance Mgmt' },
    { role: UserRole.ACCOUNTANT, icon: BarChart3, label: 'Accountant' },
    { role: UserRole.ADMIN, icon: Settings, label: 'Admin' },
    { role: UserRole.SUPER_ADMIN, icon: Globe, label: 'Super Admin' },
  ];

  return (
    <div className="w-20 md:w-64 bg-indigo-900 text-white flex flex-col shadow-xl z-20 transition-all duration-300">
      <div className="p-6 flex items-center space-x-3 mb-4">
        <div className="bg-white p-2 rounded-lg">
          <Activity className="text-indigo-900 w-6 h-6" />
        </div>
        <span className="text-xl font-bold hidden md:inline tracking-tight">MedScope CMS</span>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.role}
            onClick={() => onRoleChange(item.role)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentRole === item.role 
              ? 'bg-indigo-700 text-white shadow-lg' 
              : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${currentRole === item.role ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} />
            <span className="ml-3 font-medium hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center space-x-3 px-2 py-3 bg-indigo-950 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center font-bold text-xs">
            {currentRole.charAt(0)}
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{currentRole}</p>
            <p className="text-[10px] text-indigo-300 truncate">System Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
