import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, trend, color, subtext }) => {
  return (
    <div className="stats-card">
      <div className="stats-header">
        <div className={`icon-wrapper ${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stats-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {subtext && <span className="subtext">{subtext}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
