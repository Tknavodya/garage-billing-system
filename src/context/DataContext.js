import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // Mock Customers
  const [customers, setCustomers] = useState([
    { id: 1, name: 'John Doe', phone: '555-0101', email: 'john@example.com', visits: 5 },
    { id: 2, name: 'Alice Smith', phone: '555-0102', email: 'alice@example.com', visits: 3 },
    { id: 3, name: 'Robert Brown', phone: '555-0103', email: 'bob@test.com', visits: 8 },
  ]);

  // Mock Vehicles (Linked to customers)
  const [vehicles, setVehicles] = useState([
    { id: 1, customerId: 1, make: 'Toyota', model: 'Camry', year: 2020, plate: 'XYZ-123' },
    { id: 2, customerId: 2, make: 'Honda', model: 'Civic', year: 2018, plate: 'ABC-987' },
    { id: 3, customerId: 3, make: 'Ford', model: 'F-150', year: 2021, plate: 'TRK-555' },
  ]);

  const addCustomer = (customer) => {
    const newCustomer = { 
      ...customer, 
      id: customers.length + 1,
      visits: 0 
    };
    setCustomers([...customers, newCustomer]);
  };

  const addVehicle = (vehicle) => {
    const newVehicle = {
      ...vehicle,
      id: vehicles.length + 1
    };
    setVehicles([...vehicles, newVehicle]);
  };

  // Mock Services
  const [services, setServices] = useState([
    { id: 1, name: 'Oil Change', category: 'Maintenance', price: 45.00 },
    { id: 2, name: 'Brake Inspection', category: 'Brakes', price: 30.00 },
    { id: 3, name: 'Tire Rotation', category: 'Tires', price: 25.00 },
    { id: 4, name: 'Full Service', category: 'Maintenance', price: 150.00 },
  ]);

  // Mock Parts
  const [parts, setParts] = useState([
    { id: 1, name: 'Oil Filter', category: 'Engine', price: 12.00, stock: 50 },
    { id: 2, name: 'Brake Pads (Front)', category: 'Brakes', price: 45.00, stock: 15 },
    { id: 3, name: 'Spark Plug', category: 'Engine', price: 8.50, stock: 100 },
    { id: 4, name: 'Air Filter', category: 'Engine', price: 18.00, stock: 30 },
  ]);

  const addService = (service) => setServices([...services, { ...service, id: services.length + 1 }]);
  const addPart = (part) => setParts([...parts, { ...part, id: parts.length + 1 }]);

  return (
    <DataContext.Provider value={{ 
      customers, 
      addCustomer, 
      vehicles, 
      addVehicle,
      services,
      addService,
      parts,
      addPart
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
