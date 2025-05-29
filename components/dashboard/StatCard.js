import React from 'react';
import { memo } from 'react';

const StatCard = memo(({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className={`card bg-gradient-to-br from-${color}/10 to-${color}/5 backdrop-blur-sm border border-${color}/20 hover:shadow-lg transition-all hover:-translate-y-1 duration-300`}>
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-base-content/60 mb-1">{title}</p>
            <p className={`text-3xl font-bold text-${color}`}>{value}</p>
            <p className="text-xs text-base-content/50 mt-1">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 bg-${color}/10 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard; 