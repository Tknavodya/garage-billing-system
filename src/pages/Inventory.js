import React, { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { SearchInput } from '../components/shared/SearchInput';
import { DataTable } from '../components/shared/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input, Label } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { spareParts } from '../data/mockData';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
import './Inventory.css';

const categories = ['Filters', 'Brakes', 'Engine', 'Exterior', 'Fluids', 'Electrical'];

const SpareParts = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPart, setNewPart] = useState({
    name: '',
    partNumber: '',
    category: '',
    price: '',
    stock: '',
    minStock: '',
  });

  const filteredParts = spareParts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(search.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: 'name',
      header: 'Part Name',
      render: (part) => (
        <div>
          <p className="font-medium">{part.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{part.partNumber}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (part) => <Badge variant="secondary">{part.category}</Badge>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (part) => (
        <span className="font-medium">${part.price.toFixed(2)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (part) => {
        const isLow = part.stock < part.minStock;
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium',
                isLow && 'text-destructive'
              )}
            >
              {part.stock}
            </span>
            {isLow && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                Low stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'minStock',
      header: 'Min Stock',
      render: (part) => (
        <span className="text-muted-foreground">{part.minStock}</span>
      ),
    },
  ];

  const handleAddPart = () => {
    toast({
      title: 'Part Added',
      description: `${newPart.name} has been added to inventory.`,
    });
    setIsDialogOpen(false);
    setNewPart({ name: '', partNumber: '', category: '', price: '', stock: '', minStock: '' });
  };

  const lowStockCount = spareParts.filter((p) => p.stock < p.minStock).length;

  return (
    <div className="space-y-6 animate-fade-in inventory-page">
      <PageHeader
        title="Spare Parts"
        description="Manage your parts inventory"
        action={{
          label: 'Add Part',
          onClick: () => setIsDialogOpen(true),
          icon: Plus,
        }}
      />

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-warning-50 bg-warning-10 p-4 mb-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <p className="text-sm">
            <strong>{lowStockCount} items</strong> are running low on stock and need to be reordered.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-1" style={{ gap: '7rem' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search parts..."
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
        <p className="text-sm text-muted-foreground">
          {filteredParts.length} parts found
        </p>
      </div>

      <DataTable
        data={filteredParts}
        columns={columns}
        emptyMessage="No parts found"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name</Label>
              <Input
                id="name"
                placeholder="Oil Filter"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                placeholder="OF-2024-A"
                value={newPart.partNumber}
                onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newPart.category}
                onValueChange={(value) => setNewPart({ ...newPart, category: value })}
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
            <div className="form-grid-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="15.00"
                  value={newPart.price}
                  onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="50"
                  value={newPart.stock}
                  onChange={(e) => setNewPart({ ...newPart, stock: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  placeholder="20"
                  value={newPart.minStock}
                  onChange={(e) => setNewPart({ ...newPart, minStock: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onClick={handleAddPart} style={{ flex: 1 }}>
                Add Part
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpareParts;
