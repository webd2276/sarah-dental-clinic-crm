import React, { useState } from 'react';

interface DayData {
  day: string;
  aiCalls: number;
  manual: number;
  total: number;
}

export const WeeklyVolumeChart: React.FC = () => {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const weeklyData: DayData[] = [
    { day: 'MON', aiCalls: 12, manual: 2, total: 14 },
    { day: 'TUE', aiCalls: 18, manual: 4, total: 22 },
    { day: 'WED', aiCalls: 24, manual: 5, total: 29 },
    { day: 'THU', aiCalls: 28, manual: 4, total: 32 },
    { day: 'FRI', aiCalls: 22, manual: 3, total: 25 },
    { day: 'SAT', aiCalls: 8, manual: 2, total: 10 },
    { day: 'SUN', aiCalls: 3, manual: 1, total: 4 },
  ];

  const maxTotal = 35;

  return (
    <div className="bg-white border border-slate-200 flex flex-col p-5 sm:p-6 rounded-sm shadow-xs h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Weekly Booking Volume
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Voice AI (Vapi) vs Manual Registrations
          </p>
        </div>
        <div className="flex space-x-4 text-[10px] font-semibold">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 bg-indigo-600"></div>
            <span className="text-slate-600">AI Voice (Vapi)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 bg-slate-300"></div>
            <span className="text-slate-600">Manual</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between px-2 sm:px-4 pb-2 space-x-2 sm:space-x-4 border-l border-b border-slate-200 min-h-[160px] relative">
        {weeklyData.map((item, idx) => {
          const aiHeightPct = (item.aiCalls / maxTotal) * 100;
          const manualHeightPct = (item.manual / maxTotal) * 100;
          const isHovered = activeBar === idx;

          return (
            <div
              key={item.day}
              onMouseEnter={() => setActiveBar(idx)}
              onMouseLeave={() => setActiveBar(null)}
              className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group relative"
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap z-30 font-mono">
                  <span className="font-bold text-indigo-300">{item.day}:</span>{' '}
                  {item.total} total ({item.aiCalls} AI, {item.manual} manual)
                </div>
              )}

              {/* Bar container */}
              <div className="w-full flex flex-col items-center justify-end h-full max-w-[32px] rounded-t-xs overflow-hidden">
                {/* Manual Portion */}
                <div
                  style={{ height: `${manualHeightPct}%` }}
                  className="w-full bg-slate-300 group-hover:bg-slate-400 transition-colors"
                />
                {/* AI Portion */}
                <div
                  style={{ height: `${aiHeightPct}%` }}
                  className={`w-full transition-colors ${
                    idx === 3
                      ? 'bg-indigo-700'
                      : isHovered
                      ? 'bg-indigo-700'
                      : 'bg-indigo-600'
                  }`}
                />
              </div>

              <span
                className={`text-[9px] mt-2 font-bold tracking-wider ${
                  isHovered ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
                }`}
              >
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
