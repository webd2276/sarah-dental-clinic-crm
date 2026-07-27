import React, { useState } from 'react';
import { X, Zap, PhoneCall, MessageSquare, CheckCircle2, Copy } from 'lucide-react';

interface WebhookTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggered: () => void;
}

export const WebhookTesterModal: React.FC<WebhookTesterModalProps> = ({
  isOpen,
  onClose,
  onTriggered,
}) => {
  const [patientName, setPatientName] = useState('Arthur Holmwood');
  const [phone, setPhone] = useState('+1 (555) 456-7890');
  const [serviceType, setServiceType] = useState('Teeth Cleaning');
  const [action, setAction] = useState<'created' | 'rescheduled' | 'cancelled'>('created');
  const [channel, setChannel] = useState('call');
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setLoading(true);
    setResponseLog(null);

    try {
      const res = await fetch('/api/webhooks/n8n-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'sara_dental_crm_secret_2026',
        },
        body: JSON.stringify({
          action,
          patient_name: patientName,
          phone_number: phone,
          email: 'test.patient@example.com',
          service_type: serviceType,
          date: new Date().toISOString().split('T')[0],
          time: '11:30',
          channel,
          google_calendar_event_id: `gcal_vapi_${Date.now()}`,
          notes: `Triggered via Interactive CRM Webhook Tester (${action})`,
        }),
      });

      const data = await res.json();
      setResponseLog(JSON.stringify(data, null, 2));
      onTriggered();
    } catch (err: any) {
      setResponseLog(`Error: ${err?.message || 'Failed to execute test'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Simulate Vapi / n8n Webhook Trigger
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 bg-indigo-50 border border-indigo-100 p-3 rounded-sm leading-relaxed">
            Test the live <strong>n8n Sync Webhook Endpoint</strong> (<code className="font-mono text-[10px] bg-white px-1">POST /api/webhooks/n8n-sync</code>) directly from the UI to verify real-time Supabase updates and activity logs.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Action Event
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-2 text-xs font-bold text-slate-800 rounded-sm"
              >
                <option value="created">created</option>
                <option value="rescheduled">rescheduled</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Service
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-2 text-xs font-bold text-slate-800 rounded-sm"
              >
                <option value="Teeth Cleaning">Teeth Cleaning</option>
                <option value="Root Canal">Root Canal</option>
                <option value="Checkup">Checkup</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Source Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-2 text-xs font-bold text-slate-800 rounded-sm"
              >
                <option value="call">Vapi AI Call</option>
                <option value="whatsapp">n8n WhatsApp</option>
                <option value="web">Web Form</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunTest}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'POSTing to /api/webhooks/n8n-sync...' : 'Execute Webhook Sync Test'}
          </button>

          {responseLog && (
            <div className="space-y-1 pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Response Payload (200 OK):
              </label>
              <pre className="bg-slate-900 text-emerald-400 p-3 text-[10px] font-mono rounded-sm max-h-40 overflow-y-auto">
                {responseLog}
              </pre>
            </div>
          )}
        </div>

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
