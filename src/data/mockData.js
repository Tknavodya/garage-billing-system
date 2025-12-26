export const services = [
  {
    id: 1,
    name: 'Standard Oil Change',
    description: 'Complete oil change with synthetic blend oil and new filter.',
    category: 'Maintenance',
    price: 49.99,
    duration: '30 min'
  },
  {
    id: 2,
    name: 'Brake Pad Replacement',
    description: 'Front or rear brake pad replacement with ceramic pads.',
    category: 'Brakes',
    price: 149.99,
    duration: '1 hr'
  },
  {
    id: 3,
    name: 'Tire Rotation & Balance',
    description: 'Rotate all 4 tires and high-speed balancing.',
    category: 'Tires',
    price: 39.99,
    duration: '45 min'
  },
  {
    id: 4,
    name: 'Check Engine Light Diagnostic',
    description: 'Computer diagnostic scan to identify engine issues.',
    category: 'Engine',
    price: 89.99,
    duration: '1 hr'
  },
  {
    id: 5,
    name: 'AC Recharge',
    description: 'Recharge AC system with refrigerant and check for leaks.',
    category: 'Climate',
    price: 129.99,
    duration: '1 hr'
  }
];

export const spareParts = [
  {
    id: 1,
    name: 'Oil Filter',
    partNumber: 'OF-2024-A',
    category: 'Filters',
    price: 12.50,
    stock: 45,
    minStock: 10
  },
  {
    id: 2,
    name: 'Brake Pads (Front)',
    partNumber: 'BP-F-001',
    category: 'Brakes',
    price: 55.00,
    stock: 8,
    minStock: 15
  },
  {
    id: 3,
    name: 'Air Filter',
    partNumber: 'AF-2023-C',
    category: 'Filters',
    price: 18.00,
    stock: 25,
    minStock: 5
  },
  {
    id: 4,
    name: 'Spark Plug',
    partNumber: 'SP-NGK-09',
    category: 'Engine',
    price: 8.99,
    stock: 12,
    minStock: 20
  },
  {
    id: 5,
    name: 'Synthetic Oil (5W-30)',
    partNumber: 'OIL-SYN-5W30',
    category: 'Fluids',
    price: 35.00,
    stock: 60,
    minStock: 20
  }
];
