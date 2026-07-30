import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Settings,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'setup-guide', label: 'Setup Guide', icon: Settings },
  ];

  return (
    <nav className="w-16 sm:w-20 bg-slate-900 flex flex-col items-center py-6 space-y-6 flex-shrink-0 z-10 border-r border-slate-800">
      <div className="mb-2">
        <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-sm flex items-center justify-center font-bold text-xs border border-indigo-500/30">
          S
        </div>
      </div>

      <div className="flex-1 space-y-4 w-full flex flex-col items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-full py-3.5 flex flex-col items-center justify-center transition-all relative group ${
                isActive
                  ? 'bg-white/10 text-white border-l-2 border-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider scale-95">
                {item.label}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800/80 w-full flex flex-col items-center space-y-3">
        <div className="text-[10px] text-slate-500 font-mono text-center">
          <p className="uppercase tracking-widest font-bold text-indigo-400">VAPI</p>
          <p className="text-[8px] text-slate-400">n8n Sync</p>
        </div>
      </div>
    </nav>
  );
};
