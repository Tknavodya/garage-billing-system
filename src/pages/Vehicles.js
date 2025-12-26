import React, { useState } from 'react';
import { Search, Plus, Car } from 'lucide-react';
import { useData } from '../context/DataContext';
import Modal from '../components/common/Modal';
import './Customers.css'; // Reusing Customers CSS for table styles

const Vehicles = () => {
  const { vehicles, customers, addVehicle } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ 
    customerId: '', make: '', model: '', year: '', plate: '' 
  });

  const getCustomerName = (id) => {
    const cust = customers.find(c => c.id === parseInt(id));
    return cust ? cust.name : 'Unknown';
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(v.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addVehicle({
      ...newVehicle,
      customerId: parseInt(newVehicle.customerId)
    });
    setNewVehicle({ customerId: '', make: '', model: '', year: '', plate: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Vehicles</h1>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search items..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Vehicle Details</th>
              <th>Plate Number</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>
                  <div className="user-info">
                    <div className="avatar">
                      <Car size={16} />
                    </div>
                    <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                  </div>
                </td>
                <td><span className="badge">{vehicle.plate}</span></td>
                <td>{getCustomerName(vehicle.customerId)}</td>
                <td>
                  <button className="text-btn">History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vehicle">
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Customer</label>
            <select 
              required 
              value={newVehicle.customerId}
              onChange={e => setNewVehicle({...newVehicle, customerId: e.target.value})}
              style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Make</label>
            <input 
              required 
              value={newVehicle.make}
              onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input 
              required 
              value={newVehicle.model}
              onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input 
              type="number"
              required 
              value={newVehicle.year}
              onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Plate Number</label>
            <input 
              required 
              value={newVehicle.plate}
              onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
            <button type="submit" className="primary-btn">Save Vehicle</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
