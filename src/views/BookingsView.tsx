import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Phone,
  MessageSquare,
  Globe,
  Edit,
  Download,
} from 'lucide-react';
import type { Booking } from '../lib/crm-store';

interface BookingsViewProps {
  onOpenNewBooking: () => void;
  onOpenBookingDetail: (booking: Booking) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  onOpenNewBooking,
  onOpenBookingDetail,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (serviceFilter !== 'all') params.append('service_type', serviceFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, serviceFilter, search]);

  const handleQuickStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;

    const headers = [
      'Booking ID',
      'Patient Name',
      'Phone',
      'Email',
      'Service Type',
      'Appointment Date',
      'Appointment Time',
      'Channel',
      'Status',
      'Notes',
      'Created At',
    ];

    const escapeCSV = (str: any) => {
      if (str === null || str === undefined) return '""';
      const stringified = String(str).replace(/"/g, '""');
      return `"${stringified}"`;
    };

    const rows = bookings.map((b) => [
      b.id,
      b.patient?.full_name || 'N/A',
      b.patient?.phone || 'N/A',
      b.patient?.email || '',
      b.service_type,
      b.appointment_date,
      b.appointment_time,
      b.channel,
      b.status,
      b.notes || '',
      b.created_at || '',
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `sarah_dental_bookings_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Bookings Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live clinic schedule, Vapi voice AI appointments, and manual entries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={bookings.length === 0}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-xs disabled:opacity-50"
            title="Export filtered table as CSV report"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewBooking}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Appointment</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, phone, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-sm border border-slate-200 text-xs font-bold">
          {[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'pending', label: 'Pending' },
            { id: 'rescheduled', label: 'Rescheduled' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-xs transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service Filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm"
        >
          <option value="all">All Services</option>
          <option value="Teeth Cleaning">Teeth Cleaning</option>
          <option value="Checkup">Checkup</option>
          <option value="Filling">Filling</option>
          <option value="Root Canal">Root Canal</option>
          <option value="Teeth Whitening">Teeth Whitening</option>
          <option value="Emergency">Emergency</option>
        </select>

        <span className="text-xs font-mono font-bold text-slate-500 ml-auto">
          Total: {bookings.length}
        </span>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            Loading clinic bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No bookings found matching selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Channel</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td
                      onClick={() => onOpenBookingDetail(booking)}
                      className="px-6 py-3.5"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {booking.patient?.full_name || 'Patient'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {booking.patient?.phone || ''}
                      </div>
                    </td>

                    <td
                      onClick={() => onOpenBookingDetail(booking)}
                      className="px-6 py-3.5 font-medium text-slate-800"
                    >
                      {booking.service_type}
                    </td>

                    <td
                      onClick={() => onOpenBookingDetail(booking)}
                      className="px-6 py-3.5 font-mono text-slate-600"
                    >
                      <div>{booking.appointment_date}</div>
                      <div className="text-[10px] text-slate-400">
                        {booking.appointment_time}
                      </div>
                    </td>

                    <td
                      onClick={() => onOpenBookingDetail(booking)}
                      className="px-6 py-3.5"
                    >
                      <span className="uppercase text-[10px] font-bold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-xs">
                        {booking.channel}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs border ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : booking.status === 'rescheduled'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : booking.status === 'cancelled'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onOpenBookingDetail(booking)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded hover:bg-slate-100"
                          title="Edit Booking"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleQuickStatusChange(booking.id, 'cancelled')}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-slate-100"
                            title="Cancel Appointment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
