import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash, History, Gauge, CalendarDays, UserRound, Fuel } from 'lucide-react';
import Modal from '../../components/common/Modal';
import VehicleHistoryModal from '../../components/vehicles/VehicleHistoryModal';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchActionBar } from '../../components/shared/SearchActionBar';
import { EmptyState } from '../../components/shared/EmptyState';
import './Vehicles.css';

import { api } from '../../utils/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newVehicle, setNewVehicle] = useState({ 
    customer: '', make: '', model: '', year: '', plate_number: '', 
    color: '', fuel_type: 'Petrol', transmission: 'Manual', mileage: '', vin: ''
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
      const data = await api.get(endpoint, { auth: false });
      setVehicles(Array.isArray(data) ? data : data?.results || []);
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
          const data = await api.get('/customers/', { auth: false });
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
  const resetForm = () => {
    setNewVehicle({ customer: '', make: '', model: '', year: '', plate_number: '', color: '', fuel_type: 'Petrol', transmission: 'Manual', mileage: '', vin: '' });
    setEditingId(null);
  }

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  }

  const handleEdit = (vehicle) => {
    setNewVehicle({
      customer: vehicle.customer,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plate_number: vehicle.plate_number,
      color: vehicle.color || '',
      fuel_type: vehicle.fuel_type || 'Petrol',
      transmission: vehicle.transmission || 'Manual',
      mileage: vehicle.mileage || '',
      vin: vehicle.vin || ''
    });
    setEditingId(vehicle.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}/`);
      fetchData();
    } catch (err) {
      alert('Failed to delete vehicle: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}/`, newVehicle);
      } else {
        await api.post('/vehicles/', newVehicle);
      }
      resetForm();
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
        alert('Failed to save vehicle: ' + err.message);
    }
  };

  const handleViewHistory = (vehicleId) => {
      setSelectedVehicleId(vehicleId);
      setIsHistoryModalOpen(true);
  };

  const getVehicleTitle = (vehicle) => `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const getVehicleInitials = (vehicle) => {
    return [vehicle.make, vehicle.model]
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'V';
  };

  const getFuelType = (vehicle) => vehicle.fuel_type || vehicle.fuel || 'Fuel not recorded';

  return (
    <div className="vehicles-page page-shell animate-fade-in">
      <PageHeader
        eyebrow="Vehicle registry"
        title="Vehicles"
        description="Track plates, ownership, and workshop history with a cleaner fleet overview."
      />

      <SearchActionBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search vehicles..."
        actions={(
          <button className="primary-btn" onClick={openNewModal}>
            <Plus size={18} />
            Add Vehicle
          </button>
        )}
      />

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="vehicle-card">
            <div className="vehicle-card-top">
              <div className="vehicle-avatar">{getVehicleInitials(vehicle)}</div>
              <div className="vehicle-title-block">
                <span className="vehicle-eyebrow">Vehicle profile</span>
                <h2>{getVehicleTitle(vehicle)}</h2>
                <p>{vehicle.customer_name || 'No owner assigned'}</p>
              </div>
              <span className="plate-chip">{vehicle.plate_number}</span>
            </div>

            <div className="vehicle-meta-grid">
              <div className="vehicle-meta-item">
                <UserRound size={15} />
                <div>
                  <span>Owner</span>
                  <strong>{vehicle.customer_name || 'Unassigned'}</strong>
                </div>
              </div>
              <div className="vehicle-meta-item">
                <CalendarDays size={15} />
                <div>
                  <span>Year</span>
                  <strong>{vehicle.year}</strong>
                </div>
              </div>
              <div className="vehicle-meta-item">
                <Fuel size={15} />
                <div>
                  <span>Fuel type</span>
                  <strong>{getFuelType(vehicle)}</strong>
                </div>
              </div>
              <div className="vehicle-meta-item">
                <Gauge size={15} />
                <div>
                  <span>Transmission</span>
                  <strong>{vehicle.transmission || 'Not specified'}</strong>
                </div>
              </div>
              <div className="vehicle-meta-item">
                <Gauge size={15} />
                <div>
                  <span>Mileage</span>
                  <strong>{vehicle.mileage ? `${vehicle.mileage} km` : 'Not recorded'}</strong>
                </div>
              </div>
            </div>

            <div className="vehicle-card-footer">
              <button
                type="button"
                className="vehicle-link-btn"
                onClick={() => handleViewHistory(vehicle.id)}
              >
                <History size={16} />
                History
              </button>

              <div className="vehicle-card-actions">
                <button
                  className="icon-action-btn edit"
                  onClick={() => handleEdit(vehicle)}
                  title="Edit Vehicle"
                  type="button"
                >
                  <Edit size={17} />
                </button>
                <button
                  className="icon-action-btn delete"
                  onClick={() => handleDelete(vehicle.id)}
                  title="Delete Vehicle"
                  type="button"
                >
                  <Trash size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && vehicles.length === 0 && !error && (
        <EmptyState
          title="No vehicles found"
          description="Add a vehicle profile to connect workshop visits and billing history."
          action={(
            <button className="primary-btn" onClick={openNewModal}>
              <Plus size={18} />
              Add Vehicle
            </button>
          )}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Customer</label>
            <select 
              required 
              value={newVehicle.customer}
              onChange={e => setNewVehicle({...newVehicle, customer: e.target.value})}
              className="form-control"
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
          <div className="form-group">
            <label>Color</label>
            <input 
              value={newVehicle.color}
              onChange={e => setNewVehicle({...newVehicle, color: e.target.value})}
              placeholder="e.g. White, Black, Blue"
            />
          </div>
          <div className="form-group">
            <label>Fuel Type</label>
            <select 
              value={newVehicle.fuel_type}
              onChange={e => setNewVehicle({...newVehicle, fuel_type: e.target.value})}
              className="form-control"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
              <option value="LPG">LPG</option>
            </select>
          </div>
          <div className="form-group">
            <label>Transmission</label>
            <select 
              value={newVehicle.transmission}
              onChange={e => setNewVehicle({...newVehicle, transmission: e.target.value})}
              className="form-control"
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="CVT">CVT</option>
              <option value="DCT">DCT</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mileage (km)</label>
            <input 
              type="number"
              value={newVehicle.mileage}
              onChange={e => setNewVehicle({...newVehicle, mileage: e.target.value})}
              placeholder="e.g. 50000"
            />
          </div>
          <div className="form-group">
            <label>VIN</label>
            <input 
              value={newVehicle.vin}
              onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})}
              placeholder="17-character Vehicle Identification Number"
              maxLength="17"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
            <button type="submit" className="primary-btn">{editingId ? "Update Vehicle" : "Save Vehicle"}</button>
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
