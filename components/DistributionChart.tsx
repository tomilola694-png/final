
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceArea, ReferenceLine
} from 'recharts';

interface ChartProps {
  type?: 'normal' | 'binomial' | 'poisson';
  mu?: number;
  sigma?: number;
  n?: number;
  p?: number;
  lambda?: number;
  threshold?: number;
  comparison?: 'greater' | 'less';
}

const DistributionChart: React.FC<ChartProps> = ({ 
  type, 
  mu = 0, 
  sigma = 1, 
  n = 1, 
  p = 0.5, 
  lambda = 1,
  threshold,
  comparison = 'greater'
}) => {
  
  // If no valid type is provided, do not render anything
  if (!type || !['normal', 'binomial', 'poisson'].includes(type)) {
    return null;
  }

  const standardError = useMemo(() => {
    if (type === 'normal' && n > 1 && sigma) {
      return sigma / Math.sqrt(n);
    }
    return null;
  }, [type, sigma, n]);

  const normalData = useMemo(() => {
    if (type !== 'normal') return [];
    const points = [];
    const start = mu - 4 * sigma;
    const end = mu + 4 * sigma;
    const step = (end - start) / 100;

    for (let x = start; x <= end; x += step) {
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      const isHighlighted = threshold !== undefined ? (comparison === 'greater' ? x >= threshold : x <= threshold) : false;
      points.push({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(4)),
        isHighlighted
      });
    }
    return points;
  }, [type, mu, sigma, threshold, comparison]);

  const factorial = (num: number): number => {
    if (num <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    return res;
  };

  const discreteData = useMemo(() => {
    if (type === 'normal') return [];
    
    const points = [];
    
    if (type === 'binomial') {
      const nCr = (n: number, r: number) => {
        if (r < 0 || r > n) return 0;
        return factorial(n) / (factorial(r) * factorial(n - r));
      };

      for (let k = 0; k <= n; k++) {
        const prob = nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        const isHighlighted = threshold !== undefined ? (comparison === 'greater' ? k >= threshold : k <= threshold) : false;
        points.push({
          k,
          prob: parseFloat(prob.toFixed(4)),
          isHighlighted
        });
      }
    } else if (type === 'poisson') {
      const maxK = Math.max(10, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
      for (let k = 0; k <= maxK; k++) {
        const prob = (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
        const isHighlighted = threshold !== undefined ? (comparison === 'greater' ? k >= threshold : k <= threshold) : false;
        points.push({
          k,
          prob: parseFloat(prob.toFixed(4)),
          isHighlighted
        });
      }
    }
    
    return points;
  }, [type, n, p, lambda, threshold, comparison]);

  return (
    <div className="mt-6 p-4 bg-white border border-pink-100 rounded-2xl shadow-inner">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
            {type === 'normal' ? `Normal Distribution (μ=${mu}, σ=${sigma})` : 
             type === 'binomial' ? `Binomial Distribution (n=${n}, p=${p})` :
             `Poisson Distribution (λ=${lambda})`}
          </h4>
          {standardError && (
            <p className="text-[9px] font-bold text-black mt-1">
              Standard Error (SE): <span className="text-pink-600">{(sigma / Math.sqrt(n)).toFixed(3)}</span> 
              <span className="text-slate-400 font-normal ml-2">(n={n})</span>
            </p>
          )}
        </div>
        {threshold !== undefined && (
          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Region: P(X {comparison === 'greater' ? '≥' : '≤'} {threshold})
          </span>
        )}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'normal' ? (
            <AreaChart data={normalData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="x" 
                type="number" 
                domain={['auto', 'auto']} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                stroke="#e2e8f0"
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#f472b6' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              {standardError && (
                <ReferenceArea 
                  x1={mu - standardError} 
                  x2={mu + standardError} 
                  fill="#000" 
                  fillOpacity={0.05} 
                  stroke="#ec4899"
                  strokeDasharray="3 3"
                />
              )}
              <ReferenceLine x={mu} stroke="#000" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="y" stroke="#000" fill="url(#colorY)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey={(d) => d.isHighlighted ? d.y : 0} stroke="none" fill="#ec4899" fillOpacity={0.6} />
            </AreaChart>
          ) : (
            <BarChart data={discreteData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="k" tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#e2e8f0" />
              <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#e2e8f0" />
              <Tooltip 
                cursor={{fill: '#fdf2f8'}}
                contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#f472b6' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                {discreteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isHighlighted ? '#ec4899' : '#000'} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DistributionChart;
