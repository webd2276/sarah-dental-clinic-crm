import React, { useEffect, useState } from 'react';
import { Search, Plus, User, Phone, Mail, Calendar, ChevronRight, FileText, Download } from 'lucide-react';
import type { Patient } from '../lib/crm-store';

interface PatientsViewProps {
  onSelectPatient: (patientId: string) => void;
  onBookForPatient: (name: string, phone: string, email?: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onSelectPatient,
  onBookForPatient,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportCSV = () => {
    if (filteredPatients.length === 0) return;

    const headers = [
      'Patient ID',
      'Full Name',
      'Phone Number',
      'Email Address',
      'Medical Notes',
      'Registration Date',
    ];

    const escapeCSV = (str: any) => {
      if (str === null || str === undefined) return '""';
      const stringified = String(str).replace(/"/g, '""');
      return `"${stringified}"`;
    };

    const rows = filteredPatients.map((p) => [
      p.id,
      p.full_name,
      p.phone,
      p.email || '',
      p.notes || '',
      p.created_at || '',
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
    link.setAttribute('download', `sarah_dental_patient_directory_${dateStr}.csv`);
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
            Patient Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage patient profiles, phone records, and booking history.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name/phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 rounded-sm shadow-xs"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredPatients.length === 0}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-xs disabled:opacity-50 shrink-0"
            title="Export patient directory as CSV report"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Patient Bento Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-medium">
          Loading patient directory...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 text-center text-slate-500 text-xs">
          No patient records found matching "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient, idx) => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="bg-white border border-slate-200 p-5 rounded-sm hover:border-indigo-400 transition-all cursor-pointer shadow-xs hover:shadow-sm group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-900 text-white font-bold text-sm rounded-full flex items-center justify-center shadow-xs">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {patient.full_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {patient.phone}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-xs">
                  Active
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="font-mono text-[10px]">
                  Registered: {new Date(patient.created_at).toLocaleDateString()}
                </div>

                <div className="text-indigo-600 font-bold text-[11px] flex items-center group-hover:translate-x-0.5 transition-transform">
                  <span>View History</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
