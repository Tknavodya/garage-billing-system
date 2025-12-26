import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

export const SearchInput = ({ value, onChange, placeholder }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <Search size={16} style={{ 
        position: 'absolute', 
        left: '0.75rem', 
        top: '50%', 
        transform: 'translateY(-50%)',
        color: '#94a3b8'
      }} />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9" // Tailwind class usually, needs manual style
      />
      {/* Overriding Input style for paddingLeft since we can't easily merge className without a utility */}
      <style>{`
        input { padding-left: 2.5rem !important; }
      `}</style>
    </div>
  );
};
