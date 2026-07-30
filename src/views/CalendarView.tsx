import React from 'react';

export const CalendarView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View your scheduled appointments directly on Google Calendar.
          </p>
        </div>
      </div>

      {/* Calendar Iframe Card */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden p-4">
        <iframe 
          src="https://calendar.google.com/calendar/embed?src=4738b4b306ba3e16c1b5b52253a61426394a3ef0b03d68f1881bcdb885c07d4d%40group.calendar.google.com&ctz=UTC" 
          style={{ border: 'solid 1px #777' }} 
          width="100%" 
          height="700" 
          frameBorder="0" 
          scrolling="no"
          title="Google Calendar Embed"
        ></iframe>
      </div>
    </div>
  );
};
                                                                                                                                                                                                          