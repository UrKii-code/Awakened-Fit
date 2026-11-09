import React from 'react';
import { AttributeScores } from '../types/hunter';
import { Dumbbell, Activity, Wind, ShieldCheck, Brain, Plus } from 'lucide-react';

interface AttributeRadarProps {
  attributes: AttributeScores;
  unallocatedPoints: number;
  onAllocate?: (statKey: keyof AttributeScores) => void;
}

export const AttributeRadar: React.FC<AttributeRadarProps> = ({
  attributes,
  unallocatedPoints,
  onAllocate,
}) => {
  const statKeys: Array<{ key: keyof AttributeScores; label: string; icon: React.ReactNode; color: string; bg: string }> = [
    { key: 'strength', label: 'STR', icon: <Dumbbell className="w-3.5 h-3.5 text-amber-400" />, color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/30' },
    { key: 'endurance', label: 'END', icon: <Activity className="w-3.5 h-3.5 text-sky-400" />, color: '#38bdf8', bg: 'bg-sky-500/10 border-sky-500/30' },
    { key: 'agility', label: 'AGI', icon: <Wind className="w-3.5 h-3.5 text-emerald-400" />, color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { key: 'vitality', label: 'VIT', icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />, color: '#a855f7', bg: 'bg-purple-500/10 border-purple-500/30' },
    { key: 'discipline', label: 'DIS', icon: <Brain className="w-3.5 h-3.5 text-cyan-400" />, color: '#00e5ff', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  ];

  // SVG Radar coordinates calculation for 5 axes
  const size = 180;
  const center = size / 2;
  const maxRadius = 72;
  // Dynamic scale ceiling (at least 25 or max attribute + 5)
  const maxStatVal = Math.max(25, ...Object.values(attributes)) + 2;

  // Angles for 5-vertex polygon: -90° (top), -18°, 54°, 126°, 198°
  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const normalized = Math.min(Math.max(value / maxStatVal, 0.15), 1);
    const r = normalized * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getAxisEnd = (index: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const x = center + maxRadius * Math.cos(angle);
    const y = center + maxRadius * Math.sin(angle);
    return { x, y };
  };

  // Build polygon path
  const polygonPoints = statKeys
    .map((s, idx) => {
      const { x, y } = getCoordinates(attributes[s.key], idx);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 p-4 shadow-xl backdrop-blur-md">
      {/* Subtle holo background line */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300 font-['Rajdhani',sans-serif]">
            Hunter Attributes (Baseline 10)
          </h3>
        </div>
        
        {unallocatedPoints > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold animate-bounce">
            <span>+{unallocatedPoints} Stat Point Available</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">Verified Stats</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Radar SVG Canvas */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible drop-shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <defs>
              <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Concentric Reference Rings */}
            {[0.33, 0.66, 1].map((scale, i) => {
              const ringPoints = statKeys
                .map((_, idx) => {
                  const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                  const r = scale * maxRadius;
                  return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                })
                .join(' ');
              return (
                <polygon
                  key={i}
                  points={ringPoints}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={i === 2 ? 'none' : '2,2'}
                />
              );
            })}

            {/* Axes from Center */}
            {statKeys.map((_, idx) => {
              const { x, y } = getAxisEnd(idx);
              return (
                <line
                  key={idx}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                />
              );
            })}

            {/* Hunter Attribute Polygon */}
            <polygon
              points={polygonPoints}
              fill="url(#radarFill)"
              stroke="#00e5ff"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Vertex Markers */}
            {statKeys.map((s, idx) => {
              const { x, y } = getCoordinates(attributes[s.key], idx);
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#060913"
                  stroke={s.color}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        {/* Attribute List & Stat Point Allocation */}
        <div className="space-y-2">
          {statKeys.map((stat) => {
            const val = attributes[stat.key];
            return (
              <div
                key={stat.key}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md border ${stat.bg}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{stat.label}</div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {stat.key}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-slate-100">
                    {val.toFixed(1)}
                  </span>

                  {unallocatedPoints > 0 && onAllocate && (
                    <button
                      onClick={() => onAllocate(stat.key)}
                      title={`Allocate 1 stat point to ${stat.key}`}
                      className="p-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/60 text-amber-300 active:scale-95 transition cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
