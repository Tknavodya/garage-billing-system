import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertTriangle, Edit, Trash } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { api } from '../../utils/api';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchActionBar } from '../../components/shared/SearchActionBar';
import { EmptyState } from '../../components/shared/EmptyState';
import '../../styles/customer-page.css';

const Inventory = () => {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [newPart, setNewPart] = useState({ 
    name: '', 
    part_number: '', 
    category: 'Other', 
    price: '', 
    stock: '', 
    min_stock: '' 
  });

  const categories = ['Filters', 'Brakes', 'Engine', 'Exterior', 'Fluids', 'Electrical', 'Other'];

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/parts/';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      url += `?${params.toString()}`;

      const data = await api.get(url);
      setParts(data);
      setError('');
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError('Failed to fetch parts');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => fetchParts(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchParts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/parts/${editingId}/`, newPart);
      } else {
        await api.post('/parts/', newPart);
      }

      setIsModalOpen(false);
      setNewPart({ 
            name: '', part_number: '', category: 'Other', 
            price: '', stock: '', min_stock: '' 
      });
      setEditingId(null);
      fetchParts();
    } catch (err) {
        alert('Failed to save part: ' + err.message);
    }
  };

  const handleEdit = (part) => {
      setNewPart({
          name: part.name,
          part_number: part.part_number,
          category: part.category,
          price: part.price,
          stock: part.stock,
          min_stock: part.min_stock
      });
      setEditingId(part.id);
      setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this part?')) return;
      
      try {
          await api.delete(`/parts/${id}/`);
          fetchParts();
      } catch (err) {
          alert('Failed to delete part');
      }
  };

  const openNewModal = () => {
    setEditingId(null);
    setNewPart({ 
         name: '', part_number: '', category: 'Other', 
         price: '', stock: '', min_stock: '' 
    });
    setIsModalOpen(true);
  };

  const filteredParts = parts.filter(part => {
    if (categoryFilter === 'All') return true;
    return part.category === categoryFilter;
  });

  const lowStockCount = parts.filter(p => p.stock < p.min_stock).length;

  return (
    <div className="customers-page inventory-page page-shell">
      <PageHeader
        eyebrow="Parts inventory"
        title="Inventory"
        description="Track part stock, low inventory alerts, and replenishment status with clarity."
      />

      <SearchActionBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search parts (name, number)..."
        filters={[
          {
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'All' },
              ...categories.map((cat) => ({ label: cat, value: cat })),
            ],
          },
        ]}
        actions={(
          <button className="primary-btn" onClick={openNewModal}>
            <Plus size={18} />
            Add Part
          </button>
        )}
      />

       {lowStockCount > 0 && (
        <div style={{
            background: '#fff7ed', border: '1px solid #ffedd5', color: '#9a3412',
            padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <AlertTriangle size={20} />
          <span>
            <strong>{lowStockCount} items</strong> are running low on stock.
          </span>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Part Number</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.map(part => (
              <tr key={part.id}>
                <td style={{fontWeight: 500, color: '#0f172a'}}>{part.name}</td>
                <td style={{fontFamily: 'monospace', color: '#64748b'}}>{part.part_number}</td>
                <td>
                    <span className="badge" style={{background: '#f1f5f9', color: '#475569'}}>
                        {part.category}
                    </span>
                </td>
                <td>Rs. {part.price}</td>
                <td style={{fontWeight: 600}}>
                    {part.stock}
                </td>
                <td>
                    {part.stock < part.min_stock ? (
                        <span className="badge" style={{background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content'}}>
                            <AlertTriangle size={12} /> Low Stock
                        </span>
                    ) : (
                        <span className="badge" style={{background: '#dcfce7', color: '#166534'}}>In Stock</span>
                    )}
                </td>
                <td>
                  <div className="card-actions">
                      <button onClick={() => handleEdit(part)} className="icon-btn edit-btn" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(part.id)} className="icon-btn delete-btn" title="Delete">
                        <Trash size={16} color="#ef4444" />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
             {!loading && filteredParts.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                  No parts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredParts.length === 0 && !error && (
        <EmptyState
          title="No parts found"
          description="Stock items appear here once parts are added or filters are cleared."
          action={(
            <button className="primary-btn" onClick={openNewModal}>
              <Plus size={18} />
              Add Part
            </button>
          )}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Part" : "Add New Part"}>
        <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-group">
                <label>Part Name</label>
                <input 
                    required 
                    value={newPart.name}
                    onChange={e => setNewPart({...newPart, name: e.target.value})}
                    placeholder="e.g. Oil Filter"
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label>Part Number</label>
                <input 
                    required 
                    value={newPart.part_number}
                    onChange={e => setNewPart({...newPart, part_number: e.target.value})}
                    placeholder="e.g. OF-2024-X"
                    className="form-control"
                />
            </div>

            <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                    <label>Category</label>
                    <select 
                        value={newPart.category}
                        onChange={e => setNewPart({...newPart, category: e.target.value})}
                        className="form-control"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label>Price (Rs.)</label>
                    <input 
                        type="number" step="0.01"
                        required 
                        value={newPart.price}
                        onChange={e => setNewPart({...newPart, price: e.target.value})}
                        placeholder="0.00"
                        className="form-control"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                    <label>Current Stock</label>
                    <input 
                        type="number"
                        required 
                        value={newPart.stock}
                        onChange={e => setNewPart({...newPart, stock: e.target.value})}
                        placeholder="0"
                        className="form-control"
                    />
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label>Min Stock Alert</label>
                    <input 
                        type="number"
                        required 
                        value={newPart.min_stock}
                        onChange={e => setNewPart({...newPart, min_stock: e.target.value})}
                        placeholder="5"
                        className="form-control"
                    />
                </div>
            </div>

            <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">{editingId ? 'Update Part' : 'Add Part'}</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
