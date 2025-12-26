import React from 'react';

// A simpler implementation that maps the nested structure to a native select for functionality
// avoiding the complexity of building a custom accessible dropdown from scratch.

export const Select = ({ value, onValueChange, children }) => {
  // We need to extract options from children. This is tricky.
  // Instead, let's make a functional component that "looks" right
  // The user code separates Trigger and Content.
  
  // We will assume 'children' contains Trigger and Content.
  // We'll traverse children to find the items. This is brittle.
  
  // Better approach: Since I control the Select component code, I can make it behave differently
  // BUT the usage in Services.js is fixed.
  
  // <Select value={...} onValueChange={...}>
  //    <SelectTrigger>...</SelectTrigger>
  //    <SelectContent> <SelectItem>...</SelectItem> </SelectContent>
  // </Select>
  
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectContext = React.createContext(null);

export const SelectTrigger = ({ children, className }) => {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <div 
      onClick={() => setOpen(!open)}
      className={className} 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.375rem',
        border: '1px solid #e2e8f0',
        backgroundColor: 'white',
        fontSize: '0.875rem',
        cursor: 'pointer',
        minWidth: '180px'
      }}
    >
      {children}
      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>▼</span>
    </div>
  );
};

export const SelectValue = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  // We display the value purely. We might need a map if value != label.
  // In the user code: value="all" -> label "All Categories".
  // This simple Component doesn't know the label for the value unless we find it.
  // We'll just display value capitalized or raw for now.
  return <span style={{ textTransform: 'capitalize' }}>{value === 'all' ? 'All Categories' : value || placeholder}</span>;
};

export const SelectContent = ({ children }) => {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 50,
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children }) => {
  const { onValueChange, setOpen } = React.useContext(SelectContext);
  return (
    <div 
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
    >
      {children}
    </div>
  );
};
