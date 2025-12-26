import React, { useState } from 'react';
import { Plus, Clock, DollarSign } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { SearchInput } from '../components/shared/SearchInput';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input, Label, Textarea } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { services } from '../data/mockData';
import { useToast } from '../hooks/use-toast';
import './Services.css';

const categories = ['Maintenance', 'Brakes', 'Tires', 'Engine', 'Climate', 'Transmission', 'Electrical'];

const Services = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
  });

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddService = () => {
    toast({
      title: 'Service Added',
      description: `${newService.name} has been added to the catalog.`,
    });
    setIsDialogOpen(false);
    setNewService({ name: '', description: '', category: '', price: '', duration: '' });
  };

  return (
    <div className="services-page fade-in">
      <PageHeader
        title="Services"
        description="Manage your service catalog"
        action={{
          label: 'Add Service',
          onClick: () => setIsDialogOpen(true),
          icon: Plus,
        }}
      />

      <div className="filters-container">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search services..."
        />
        <div style={{ width: '200px' }}>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="services-grid">
        {filteredServices.map((service) => (
          <Card key={service.id} className="service-card">
            <CardContent>
              <div className="card-header-row">
                <Badge variant="secondary">{service.category}</Badge>
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-desc">{service.description}</p>
              <div className="service-footer">
                <div className="service-meta">
                  <Clock size={16} />
                  {service.duration}
                </div>
                <div className="service-price">
                  <DollarSign size={16} />
                  {service.price.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="empty-state">
          No services found
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <div className="form-stack">
            <div className="form-item">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                placeholder="Oil Change"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
            </div>
            <div className="form-item">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the service..."
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </div>
            <div className="form-item">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newService.category}
                onValueChange={(value) => setNewService({ ...newService, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-grid-2">
              <div className="form-item">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="75.00"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                />
              </div>
              <div className="form-item">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="30 min"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                />
              </div>
            </div>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onClick={handleAddService} style={{ flex: 1 }}>
                Add Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;
