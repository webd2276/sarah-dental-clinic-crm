import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import type { Booking } from '../lib/crm-store';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onUpdated,
}) => {
  if (!booking) return null;

  const [status, setStatus] = useState<Booking['status']>(booking.status);
  const [date, setDate] = useState<string>(booking.appointment_date);
  const [time, setTime] = useState<string>(booking.appointment_time);
  const [notes, setNotes] = useState<string>(booking.notes || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus?: Booking['status']) => {
    setLoading(true);
    const targetStatus = newStatus || status;

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          appointment_date: date,
          appointment_time: time,
          notes,
        }),
      });

      if (res.ok) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              Booking Detail #{booking.id.slice(0, 8)}
            </span>
            <h3 className="text-base font-bold text-white">
              {booking.service_type}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient Card Header */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">
                {booking.patient?.full_name || 'Patient'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {booking.patient?.phone || 'No phone'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Channel
              </span>
              <span className="text-xs font-bold uppercase text-indigo-600">
                {booking.channel}
              </span>
            </div>
          </div>

          {/* Appointment Date / Time edit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Appointment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Appointment Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Current Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'confirmed', label: 'Confirmed', color: 'emerald' },
                { id: 'pending', label: 'Pending', color: 'slate' },
                { id: 'rescheduled', label: 'Rescheduled', color: 'amber' },
                { id: 'cancelled', label: 'Cancelled', color: 'red' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id as Booking['status'])}
                  className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all ${
                    status === item.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm"
            />
          </div>

          {/* Google Calendar ID info */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-sm flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-medium">
              Google Calendar Event ID:
            </span>
            <span className="font-mono text-[10px] font-bold text-emerald-900">
              {booking.google_calendar_event_id || 'Auto-synced'}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={() => handleUpdate('cancelled')}
              className="text-red-600 hover:text-red-700 text-xs font-bold uppercase tracking-wider flex items-center space-x-1"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Booking</span>
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdate()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save & Sync'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
