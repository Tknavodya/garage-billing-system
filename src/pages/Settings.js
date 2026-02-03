import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import Modal from '../components/common/Modal';
import { api } from '../utils/api';
import './Settings.css';

const Settings = () => {
  const { toast } = useToast();
  
  // Business Info State
  const [garageSettings, setGarageSettings] = useState({
      garage_name: '',
      email: '',
      phone: '',
      address: ''
  });

  // Account State
  const [user, setUser] = useState({
      name: '',
      email: ''
  });

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
      old_password: '',
      new_password: '',
      confirm_password: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
     fetchSettings();
  }, []);

  const fetchSettings = async () => {
      try {
          const [settingsData, userData] = await Promise.all([
              api.get('/settings/'),
              api.get('/users/me/')
          ]);

          if (settingsData) setGarageSettings(settingsData);
          if (userData) setUser({ name: userData.name, email: userData.email });

      } catch (err) {
          console.error("Failed to fetch settings", err);
      }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        await Promise.all([
            api.put('/settings/', garageSettings),
            api.put('/users/update_profile/', user)
        ]);

        toast({
            title: 'Settings Saved',
            description: 'Your changes have been saved successfully.',
        });

    } catch (err) {
        toast({
            title: 'Error',
            description: 'Failed to save settings.',
            variant: 'destructive'
        });
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
      e.preventDefault();
      if (passwords.new_password !== passwords.confirm_password) {
          alert("New passwords do not match");
          return;
      }
      
      try {
          await api.post('/users/change_password/', {
              old_password: passwords.old_password,
              new_password: passwords.new_password,
              new_password_confirm: passwords.confirm_password
          });

          alert("Password changed successfully");
          setIsPasswordModalOpen(false);
          setPasswords({ old_password: '', new_password: '', confirm_password: '' });
      } catch (err) {
          alert(err.message || "Failed to change password");
      }
  };

  return (
    <div className="settings-page animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage your garage settings and preferences"
      />

      <div className="settings-grid">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your garage details that appear on invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="form-stack">
            <div className="form-group half-width">
              <Label htmlFor="garageName">Garage Name</Label>
              <Input
                id="garageName"
                value={garageSettings.garage_name}
                onChange={(e) => setGarageSettings({...garageSettings, garage_name: e.target.value})}
              />
            </div>
            <div className="form-group half-width">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={garageSettings.email}
                onChange={(e) => setGarageSettings({...garageSettings, email: e.target.value})}
              />
            </div>
            <div className="form-group half-width">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={garageSettings.phone}
                onChange={(e) => setGarageSettings({...garageSettings, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={garageSettings.address}
                onChange={(e) => setGarageSettings({...garageSettings, address: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your admin account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="form-stack">
            <div className="form-group half-width">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
              />
            </div>
            <div className="form-group half-width">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={user.email}
                onChange={(e) => setUser({...user, email: e.target.value})}
              />
            </div>
            <Button className="w-full mt-4 primary-blue-btn" onClick={() => setIsPasswordModalOpen(true)}>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="settings-actions">
        <Button onClick={handleSave} size="lg" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Modal 
          isOpen={isPasswordModalOpen} 
          onClose={() => setIsPasswordModalOpen(false)} 
          title="Change Password"
      >
          <form onSubmit={handleChangePassword} className="form-stack" style={{marginTop: '1rem'}}>
              <div className="form-group">
                  <Label>Current Password</Label>
                  <Input 
                      type="password" 
                      autoComplete="current-password"
                      value={passwords.old_password}
                      onChange={e => setPasswords({...passwords, old_password: e.target.value})}
                      required
                  />
              </div>
              <div className="form-group">
                  <Label>New Password</Label>
                  <Input 
                      type="password" 
                      autoComplete="new-password"
                      value={passwords.new_password}
                      onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                      required
                  />
              </div>
              <div className="form-group">
                  <Label>Confirm New Password</Label>
                  <Input 
                      type="password" 
                      autoComplete="new-password"
                      value={passwords.confirm_password}
                      onChange={e => setPasswords({...passwords, confirm_password: e.target.value})}
                      required
                  />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                  <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Update Password</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default Settings;
