export const services = [
  {
    id: 1,
    name: 'Standard Oil Change',
    description: 'Complete oil change with synthetic blend oil and new filter.',
    category: 'Maintenance',
    price: 4500,
    duration: '30 min'
  },
  {
    id: 2,
    name: 'Brake Pad Replacement',
    description: 'Front or rear brake pad replacement with ceramic pads.',
    category: 'Brakes',
    price: 8500,
    duration: '1 hr'
  },
  {
    id: 3,
    name: 'Tire Rotation & Balance',
    description: 'Rotate all 4 tires and high-speed balancing.',
    category: 'Tires',
    price: 2500,
    duration: '45 min'
  },
  {
    id: 4,
    name: 'Check Engine Light Diagnostic',
    description: 'Computer diagnostic scan to identify engine issues.',
    category: 'Engine',
    price: 3500,
    duration: '1 hr'
  },
  {
    id: 5,
    name: 'AC Recharge',
    description: 'Recharge AC system with refrigerant and check for leaks.',
    category: 'Climate',
    price: 6500,
    duration: '1 hr'
  }
];

export const spareParts = [
  {
    id: 1,
    name: 'Oil Filter',
    partNumber: 'OF-2024-A',
    category: 'Filters',
    price: 1800,
    stock: 45,
    minStock: 10
  },
  {
    id: 2,
    name: 'Brake Pads (Front)',
    partNumber: 'BP-F-001',
    category: 'Brakes',
    price: 6500,
    stock: 8,
    minStock: 15
  },
  {
    id: 3,
    name: 'Air Filter',
    partNumber: 'AF-2023-C',
    category: 'Filters',
    price: 2200,
    stock: 25,
    minStock: 5
  },
  {
    id: 4,
    name: 'Spark Plug',
    partNumber: 'SP-NGK-09',
    category: 'Engine',
    price: 1500,
    stock: 12,
    minStock: 20
  },
  {
    id: 5,
    name: 'Synthetic Oil (5W-30)',
    partNumber: 'OIL-SYN-5W30',
    category: 'Fluids',
    price: 4800,
    stock: 60,
    minStock: 20
  }
];
