import React, { useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import './Settings.css';

const Settings = () => {
  const { toast } = useToast();
  const [garageName, setGarageName] = useState('AutoGarage');
  const [email, setEmail] = useState('support@autogarage.com');
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [address, setAddress] = useState('123 Garage Street, New York, NY 10001');
  const [taxRate, setTaxRate] = useState('8');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [overdueReminders, setOverdueReminders] = useState(true);

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your changes have been saved successfully.',
    });
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
            <div className="form-group">
              <Label htmlFor="garageName">Garage Name</Label>
              <Input
                id="garageName"
                value={garageName}
                onChange={(e) => setGarageName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>
              Configure invoice generation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="form-stack">
            <div className="form-group">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                defaultValue="INV"
                placeholder="INV"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                defaultValue="14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage email and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="notifications-stack">
            <div className="notification-item">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates for new invoices and payments
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="notification-item">
              <div>
                <p className="font-medium">Overdue Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Send automatic reminders for overdue invoices
                </p>
              </div>
              <Switch
                checked={overdueReminders}
                onCheckedChange={setOverdueReminders}
              />
            </div>
            <Separator />
            <div className="notification-item">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when parts inventory is low
                </p>
              </div>
              <Switch defaultChecked />
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
            <div className="form-group">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                defaultValue="Admin User"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                defaultValue="admin@autogarage.com"
              />
            </div>
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="settings-actions">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
