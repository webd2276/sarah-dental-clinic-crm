import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  PhoneCall,
  CheckCircle2,
  User,
  LogOut,
  Bell,
  X,
  Webhook,
  Zap,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react';
import type { ActivityLog } from '../lib/crm-store';

interface HeaderProps {
  currentTab: string;
  userEmail?: string;
  onLogout?: () => void;
  onOpenNewBooking: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  userEmail = 'Dr. Sarah Miller',
  onLogout,
  onOpenNewBooking,
  onNavigateTab,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activity');
      const data = await res.json();
      if (data.activity) {
        setActivities(data.activity);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs for notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const unreadCount = activities.filter((act) => !readIds.has(act.id)).length;

  const handleMarkAllAsRead = () => {
    const allIds = new Set(activities.map((a) => a.id));
    setReadIds(allIds);
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-20 relative">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <img src="/logo.png" alt="Sara AI Logo" className="w-10 h-10 object-contain" />
        <div className="flex items-center space-x-2">
          <h1 className="text-base lg:text-lg font-bold tracking-tight uppercase text-slate-800">
            SARA AI DENTIST
          </h1>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline text-xs font-semibold text-slate-500 uppercase tracking-wider">
            CRM Command Center
          </span>
        </div>
      </div>

      {/* Status Badges & User Menu */}
      <div className="flex items-center space-x-3 lg:space-x-5">
        {/* Vapi Sync Status */}
        <div className="hidden md:flex items-center text-[11px] font-semibold space-x-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="uppercase tracking-wider">VAPI SYNC ACTIVE</span>
        </div>

        {/* Quick New Booking Button */}
        <button
          onClick={onOpenNewBooking}
          className="hidden sm:flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors shadow-sm"
        >
          <span>+ New Booking</span>
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-sm transition-colors border border-slate-200 flex items-center justify-center"
            title="System Alerts & Activity Logs"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs border border-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-sm shadow-xl z-50 overflow-hidden flex flex-col">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    n8n Sync Alerts & Logs
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-indigo-300 hover:text-white underline font-semibold transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Logs List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {loading && activities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Loading recent system events...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No recent activity logs.
                  </div>
                ) : (
                  activities.map((act) => {
                    const isRead = readIds.has(act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => {
                          setReadIds((prev) => new Set(prev).add(act.id));
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 ${
                          !isRead ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {act.action === 'booking_created' ? (
                            <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          ) : act.action === 'booking_rescheduled' ? (
                            <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                              <Webhook className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900 truncate">
                              {act.patient?.full_name || 'Patient Event'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              {getTimeAgo(act.created_at)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight">
                            {act.description}
                          </p>

                          <div className="mt-1.5 flex items-center space-x-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-600 border border-slate-200">
                              {act.channel || 'n8n-sync'}
                            </span>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              <div className="bg-slate-50 p-2.5 border-t border-slate-200 text-center flex items-center justify-between px-4">
                <span className="text-[10px] text-slate-500 font-mono">
                  Live n8n & Google Sync
                </span>
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateTab('setup-guide');
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center"
                  >
                    <span>View Setup Diagnostics</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-3 lg:pl-5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{userEmail}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
              Clinic Administrator
            </p>
          </div>
          <div className="w-9 h-9 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-inner">
            SM
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
