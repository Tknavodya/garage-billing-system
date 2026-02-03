import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Car } from 'lucide-react';
import Modal from '../components/common/Modal';
import VehicleHistoryModal from '../components/vehicles/VehicleHistoryModal';
import './Customers.css';

import { api } from '../utils/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ 
    customer: '', make: '', model: '', year: '', plate_number: '' 
  });
  
  // History Modal State
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Vehicles
      const endpoint = searchTerm 
        ? `/vehicles/?search=${encodeURIComponent(searchTerm)}` 
        : '/vehicles/';
      const data = await api.get(endpoint);
      setVehicles(data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchCustomers = useCallback(async () => {
      try {
          const data = await api.get('/customers/');
          setCustomers(data);
      } catch(err) {
          console.error("Error fetching customers for dropdown", err);
      }
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]);

  useEffect(() => {
      fetchCustomers();
  }, [fetchCustomers]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles/', newVehicle);
      setNewVehicle({ customer: '', make: '', model: '', year: '', plate_number: '' });
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
        alert('Failed to add vehicle: ' + err.message);
    }
  };

  const handleViewHistory = (vehicleId) => {
      setSelectedVehicleId(vehicleId);
      setIsHistoryModalOpen(true);
  };

  return (
    <div className="customers-page animate-fade-in">
      <div className="page-header">
        <h1>Vehicles</h1>
      </div>

      <div className="actions-bar">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

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
            {vehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>
                  <div className="user-info">
                    <div className="avatar">
                      <Car size={16} />
                    </div>
                    <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                  </div>
                </td>
                <td><span className="badge">{vehicle.plate_number}</span></td>
                <td>
                    <div className="contact-info">
                        <span>{vehicle.customer_name}</span>
                    </div>
                </td>
                <td>
                  <button 
                    className="text-btn" 
                    onClick={() => handleViewHistory(vehicle.id)}
                  >
                    History
                  </button>
                </td>
              </tr>
            ))}
             {!loading && vehicles.length === 0 && (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vehicle">
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Customer</label>
            <select 
              required 
              value={newVehicle.customer}
              onChange={e => setNewVehicle({...newVehicle, customer: e.target.value})}
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
              placeholder="e.g. Toyota, Honda, Ford"
            />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input 
              required 
              value={newVehicle.model}
              onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
              placeholder="e.g. Camry, Civic, F-150"
            />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input 
              type="number"
              required 
              value={newVehicle.year}
              onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
              placeholder="e.g. 2023"
            />
          </div>
          <div className="form-group">
            <label>Plate Number</label>
            <input 
              required 
              value={newVehicle.plate_number}
              onChange={e => setNewVehicle({...newVehicle, plate_number: e.target.value})}
              placeholder="e.g. ABC-1234"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
            <button type="submit" className="primary-btn">Save Vehicle</button>
          </div>
        </form>
      </Modal>

      <VehicleHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        vehicleId={selectedVehicleId}
      />
    </div>
  );
};

export default Vehicles;
