interface DonutSubject {
  id: string;
  name: string;
  color: string;
  progress: number;
}

interface CompletionDonutChartProps {
  subjects: DonutSubject[];
}

const COLOR_HEX: Record<string, string> = {
  teal: '#10b981',
  indigo: '#818cf8',
  orange: '#fbbf24',
  red: '#f43f5e',
  purple: '#a855f7',
  blue: '#60a5fa',
};

export default function CompletionDonutChart({ subjects }: CompletionDonutChartProps) {
  const radius = 70;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const totalProgress = subjects.reduce((sum, s) => sum + s.progress, 0) || 1;

  let offsetAccumulator = 0;
  const slices = subjects.map((subject) => {
    const fraction = subject.progress / totalProgress;
    const dash = fraction * circumference;
    const slice = {
      subject,
      dasharray: `${dash} ${circumference - dash}`,
      dashoffset: -offsetAccumulator,
      color: COLOR_HEX[subject.color] || '#71717a',
    };
    offsetAccumulator += dash;
    return slice;
  });

  const overallAverage = subjects.length
    ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length)
    : 0;

  return (
    <div className="bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-8 mt-8">
      <h2 className="font-display font-bold text-xl text-white mb-8">Completion by subject</h2>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-zinc-500">No subjects yet</p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row items-center xl:items-start gap-10">
          {/* Donut Chart */}
          <div className="relative flex-shrink-0" style={{ width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
              <circle 
                cx="100" cy="100" r={radius} 
                fill="transparent" 
                stroke="#27272a" 
                strokeWidth={strokeWidth} 
              />
              {slices.map(({ subject, dasharray, dashoffset, color }, ) => (
                <circle
                  key={subject.id}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dasharray}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{overallAverage}%</span>
              <span className="text-sm text-zinc-500 mt-1">average completion</span>
            </div>
          </div>

          
          <div className="flex-1 space-y-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLOR_HEX[subject.color] || '#71717a' }}
                />
                <span className="text-zinc-300 flex-1">{subject.name}</span>
                <span className="font-mono text-white font-semibold">{subject.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}