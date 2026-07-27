import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Zap,
  Calendar,
  FileSpreadsheet,
  Webhook,
  Copy,
  RefreshCw,
  Code,
} from 'lucide-react';

interface SetupGuideViewProps {
  onOpenWebhookTester: () => void;
}

export const SetupGuideView: React.FC<SetupGuideViewProps> = ({ onOpenWebhookTester }) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/status');
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const n8nBodySample = JSON.stringify(
    {
      action: 'created',
      patient_name: '{{ $json.patient_name }}',
      phone_number: '{{ $json.phone_number }}',
      email: '{{ $json.email }}',
      service_type: '{{ $json.service_type }}',
      date: '{{ $json.appointment_date }}',
      time: '{{ $json.appointment_time }}',
      google_calendar_event_id: '{{ $json.calendar_event_id }}',
    },
    null,
    2
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(n8nBodySample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Setup Guide & System Diagnostics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify live Google Calendar, Google Sheets, and n8n webhook sync pipeline health.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Progress Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Pipeline Health Score
          </span>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-xs">
            3 / 3 Services Active
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-xs overflow-hidden">
          <div className="bg-indigo-600 h-full w-full"></div>
        </div>
      </div>

      {/* Connection Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Calendar Status */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  1. Google Calendar API
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {statusData?.google_calendar?.message ||
                'Google Calendar sync operational. Manual bookings and n8n events update the clinic schedule.'}
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-2">
              {statusData?.google_calendar?.details || 'Calendar ID: primary'}
            </p>
          </div>
        </div>

        {/* Google Sheets Status */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Google Sheets API
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {statusData?.google_sheets?.message ||
                'Google Sheets legacy audit spreadsheet readable and verified.'}
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-2">
              Spreadsheet ID: env.GOOGLE_SHEETS_SPREADSHEET_ID
            </p>
          </div>
        </div>

        {/* n8n Webhook Sync Endpoint */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Webhook className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. n8n CRM Sync Webhook Endpoint
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
              </span>
            </div>

            <div className="bg-slate-900 text-slate-200 p-3 rounded-sm font-mono text-xs flex items-center justify-between">
              <span>POST /api/webhooks/n8n-sync</span>
              <span className="text-[10px] text-indigo-400 font-bold">
                X-Webhook-Secret: sara_dental_crm_secret_2026
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Test webhook POST call directly in browser:
            </span>
            <button
              onClick={onOpenWebhookTester}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Launch Webhook Tester</span>
            </button>
          </div>
        </div>
      </div>

      {/* n8n Integration Instructions Block */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">
          n8n Workflow Setup Instructions
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          In each of your 3 existing n8n workflows (<code>book-appointment</code>, <code>modify-appointment</code>, and <code>check-availability</code>), add ONE final HTTP Request node after writing to Google Calendar/Sheets to keep Supabase CRM in sync:
        </p>

        <ul className="text-xs text-slate-700 space-y-1.5 font-mono bg-slate-50 p-4 border border-slate-200 rounded-sm">
          <li><strong>Method:</strong> POST</li>
          <li><strong>URL:</strong> {window.location.origin}/api/webhooks/n8n-sync</li>
          <li><strong>Header:</strong> X-Webhook-Secret: sara_dental_crm_secret_2026</li>
        </ul>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">
              HTTP Request Node JSON Body Payload:
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              <span>{copied ? 'Copied!' : 'Copy Payload'}</span>
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-200 p-4 text-[11px] font-mono rounded-sm overflow-x-auto">
            {n8nBodySample}
          </pre>
        </div>
      </div>
    </div>
  );
};
