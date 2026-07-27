import React, { useEffect, useState } from 'react';
import { X, User, Phone, Mail, Calendar, Clock, CheckCircle2, FileText, Plus } from 'lucide-react';
import type { Patient, Booking } from '../lib/crm-store';

interface PatientProfileModalProps {
  patientId: string | null;
  onClose: () => void;
  onBookForPatient: (patientName: string, phone: string, email?: string) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patientId,
  onClose,
  onBookForPatient,
}) => {
  const [data, setData] = useState<(Patient & { bookings: Booking[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    fetch(`/api/patients/${patientId}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [patientId]);

  if (!patientId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Patient Profile & Visit History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !data ? (
          <div className="p-12 text-center text-slate-500 font-medium text-xs">
            Loading patient records...
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Summary Card */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 text-white font-bold text-lg rounded-full flex items-center justify-center shadow-sm">
                  {data.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {data.full_name}
                  </h4>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 font-mono">
                    <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {data.phone}</span>
                    {data.email && <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {data.email}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onBookForPatient(data.full_name, data.phone, data.email || undefined);
                  onClose();
                }}
                className="flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>

            {/* Visit History Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                Appointment History ({data.bookings.length})
              </h4>

              {data.bookings.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                  No appointment history logged yet.
                </div>
              ) : (
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-200">
                  {data.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-slate-200 p-4 rounded-sm hover:border-slate-300 transition-colors relative"
                    >
                      <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white"></div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {booking.service_type}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'rescheduled'
                              ? 'bg-amber-100 text-amber-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-3">
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {booking.appointment_date}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {booking.appointment_time}</span>
                        <span className="uppercase text-indigo-600 font-semibold">{booking.channel}</span>
                      </div>
                      {booking.notes && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 border-l-2 border-indigo-400 italic">
                          "{booking.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
