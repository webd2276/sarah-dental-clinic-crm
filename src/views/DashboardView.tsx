import React, { useEffect, useState } from 'react';
import {
  Calendar,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  Plus,
  Zap,
  ChevronRight,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { WeeklyVolumeChart } from '../components/WeeklyVolumeChart';
import type { Booking, ActivityLog } from '../lib/crm-store';

interface DashboardViewProps {
  onOpenNewBooking: () => void;
  onOpenBookingDetail: (booking: Booking) => void;
  onOpenWebhookTester: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewBooking,
  onOpenBookingDetail,
  onOpenWebhookTester,
  onNavigateTab,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/activity'),
      ]);

      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      setStats(statsData);
      setRecentActivity(activityData.activity || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Good Morning, Sarah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is your clinic overview and real-time AI automation sync for today.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenWebhookTester}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-xs"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Test Webhook Sync</span>
          </button>
        </div>
      </div>

      {/* Stats Row (4-Column Bento Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Today's Appointments */}
        <div className="bg-white p-5 border border-slate-200 flex flex-col justify-between space-y-2 rounded-sm shadow-xs hover:border-slate-300 transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Today's Appointments
          </span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-slate-800">
              {stats?.todayBookingsCount || 14}
            </span>
            <span className="text-xs text-emerald-600 font-medium mb-1 flex items-center">
              +2 new
            </span>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Confirmed: {stats?.statusCounts?.confirmed || 10}</span>
            <span className="text-amber-600 font-semibold">Pending: {stats?.todayPendingCount || 3}</span>
          </div>
        </div>

        {/* Stat 2: AI Voice Inquiries */}
        <div className="bg-white p-5 border border-slate-200 flex flex-col justify-between space-y-2 rounded-sm shadow-xs hover:border-slate-300 transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            AI Voice Inquiries (Vapi)
          </span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-slate-800">
              {stats?.vapiCallsCount || 52}
            </span>
            <span className="text-xs text-slate-400 font-medium mb-1">
              last 24h
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold border-t border-slate-100 pt-2 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            <span>98.4% automated completion</span>
          </div>
        </div>

        {/* Stat 3: WhatsApp Conversions */}
        <div className="bg-white p-5 border border-slate-200 flex flex-col justify-between space-y-2 rounded-sm shadow-xs hover:border-slate-300 transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            WhatsApp Conversions (n8n)
          </span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-slate-800">68%</span>
            <span className="text-xs text-emerald-600 font-medium mb-1">
              ↑ 12%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Synced to Supabase</span>
            <span className="text-indigo-600 font-semibold">Real-time</span>
          </div>
        </div>

        {/* Stat 4: CTA + New Booking */}
        <div
          onClick={onOpenNewBooking}
          className="bg-indigo-600 p-5 border border-indigo-700 flex flex-col justify-center items-center text-white cursor-pointer hover:bg-indigo-700 transition-all rounded-sm shadow-xs group"
        >
          <span className="text-xs font-bold uppercase tracking-widest flex items-center">
            <Plus className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
            + New Booking
          </span>
          <span className="text-[10px] opacity-80 mt-1 font-medium">
            Manual Override & Calendar Sync
          </span>
        </div>
      </div>

      {/* Middle Section: Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyVolumeChart />
        </div>

        {/* Service Breakdown */}
        <div className="bg-white border border-slate-200 p-6 flex flex-col rounded-sm shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">
            Service Breakdown
          </h3>

          <div className="space-y-4 flex-1">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-700">Teeth Cleaning</span>
                <span className="text-xs font-mono font-bold text-slate-900">42%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                <div className="bg-indigo-600 h-full w-[42%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-700">Checkups</span>
                <span className="text-xs font-mono font-bold text-slate-900">28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                <div className="bg-sky-500 h-full w-[28%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-700">Root Canal</span>
                <span className="text-xs font-mono font-bold text-slate-900">18%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                <div className="bg-amber-500 h-full w-[18%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-700">Emergency & Fillings</span>
                <span className="text-xs font-mono font-bold text-slate-900">12%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                <div className="bg-red-500 h-full w-[12%]"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center italic font-serif">
              "Clinic efficiency boosted by 34% since Vapi voice AI integration"
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Log */}
      <div className="bg-white border border-slate-200 overflow-hidden flex flex-col rounded-sm shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Recent Activity Audit Trail
            </h3>
            <p className="text-[10px] text-slate-400">
              Live updates logged from Vapi, n8n WhatsApp, and CRM desk.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider flex items-center"
          >
            <span>View Full Audit Trail</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 font-bold">Timestamp</th>
                <th className="px-6 py-3 font-bold">Action Event</th>
                <th className="px-6 py-3 font-bold">Channel</th>
                <th className="px-6 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {recentActivity.slice(0, 6).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {item.description}
                  </td>
                  <td className="px-6 py-3">
                    <span className="uppercase text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-xs">
                      {item.channel || 'system'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-0.5 font-bold uppercase text-[9px] rounded-xs ${
                        item.action === 'booking_created'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.action === 'booking_rescheduled'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.action.replace('booking_', '')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
