import React, { useEffect, useMemo, useState } from 'react';
import { Users as UsersIcon, UserCheck, Search, RotateCcw, ShieldAlert, ShieldCheck, PencilLine, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input, Label } from '../../components/ui/input';
import Modal from '../../components/common/Modal';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Users.css';

const getInitials = (name) => {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionUserId, setActionUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'staff',
  });
  const [savingUserId, setSavingUserId] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const data = await api.get('/users/');
      setUsers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...users]
      .sort((left, right) => Number(left.is_active) - Number(right.is_active))
      .filter((user) => {
        if (!query) return true;
        return [user.name, user.email, user.role]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
  }, [users, search]);

  const pendingUsers = users.filter((user) => !user.is_active);
  const activeUsers = users.filter((user) => user.is_active);

  const handleToggleActive = async (userId) => {
    setActionUserId(userId);
    try {
      await api.post(`/users/${userId}/toggle_active/`, {});
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name || 'this user'}? This cannot be undone.`)) {
      return;
    }

    setDeletingUserId(user.id);
    try {
      await api.delete(`/users/${user.id}/`);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'staff',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setSavingUserId(editingUser.id);
    try {
      await api.put(`/users/${editingUser.id}/`, editForm);
      await fetchUsers();
      closeEditModal();
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return <div className="page-shell users-page">Loading users...</div>;
  }

  return (
    <div className="users-page page-shell animate-fade-in">
      <PageHeader
        eyebrow="Access control"
        title="Users"
        description="Review pending registrations, activate approved staff, and keep garage access under control."
      />

      <div className="users-stats-grid">
        <Card className="users-stat-card">
          <CardContent className="users-stat-content">
            <div className="users-stat-icon pending">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="users-stat-label">Pending review</span>
              <strong className="users-stat-value">{pendingUsers.length}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="users-stat-card">
          <CardContent className="users-stat-content">
            <div className="users-stat-icon active">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="users-stat-label">Active access</span>
              <strong className="users-stat-value">{activeUsers.length}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="users-stat-card">
          <CardContent className="users-stat-content">
            <div className="users-stat-icon total">
              <UsersIcon size={18} />
            </div>
            <div>
              <span className="users-stat-label">Total accounts</span>
              <strong className="users-stat-value">{users.length}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="users-toolbar-card">
        <CardContent className="users-toolbar">
          <div className="users-search-field">
            <Label htmlFor="user-search">Search users</Label>
            <div className="users-search-shell">
              <Search size={16} />
              <Input
                id="user-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or role"
              />
            </div>
          </div>

          <Button onClick={fetchUsers} className="users-refresh-btn" disabled={refreshing}>
            <RotateCcw size={16} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      {error && <div className="users-error-banner">{error}</div>}

      <Card className="users-table-card">
        <CardHeader>
          <CardTitle>Account review queue</CardTitle>
          <CardDescription>
            New signups appear as pending until an administrator activates them.
          </CardDescription>
        </CardHeader>
        <CardContent className="users-table-shell">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="users-empty-state">
                      <strong>No users found.</strong>
                      <span>Try a different search or refresh the list.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = Boolean(user.is_active);
                  const isSelf = currentUser?.id === user.id;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-identity">
                          <div className="user-avatar">{getInitials(user.name)}</div>
                          <div className="user-copy">
                            <strong>{user.name}</strong>
                            <span>User ID #{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className="user-role-chip">{user.role}</span>
                      </td>
                      <td>
                        <StatusBadge status={isActive ? 'Active' : 'Pending'} />
                      </td>
                      <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="user-action-icon edit"
                            title="Edit"
                            aria-label="Edit user"
                          >
                            <PencilLine size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingUserId === user.id || isSelf}
                            className="user-action-icon delete"
                            title={deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                            aria-label={deletingUserId === user.id ? 'Deleting user' : 'Delete user'}
                          >
                            <Trash2 size={16} />
                          </button>
                          <Button
                            onClick={() => handleToggleActive(user.id)}
                            disabled={actionUserId === user.id}
                            className={`user-action-btn ${isActive ? 'deactivate' : 'activate'}`}
                          >
                            {isActive ? <ShieldAlert size={16} /> : <UserCheck size={16} />}
                            {actionUserId === user.id
                              ? 'Updating...'
                              : isActive
                                ? 'Deactivate'
                                : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit user"
        maxWidth="560px"
      >
        <form onSubmit={handleSaveUser} className="user-edit-form">
          <div className="form-group">
            <Label htmlFor="edit-name">Full name</Label>
            <Input
              id="edit-name"
              value={editForm.name}
              onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
              placeholder="Full name"
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={editForm.email}
              onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
              placeholder="name@garage.com"
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="edit-role">Role</Label>
            <select
              id="edit-role"
              value={editForm.role}
              onChange={(event) => setEditForm({ ...editForm, role: event.target.value })}
              className="premium-input user-role-select"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="modal-actions user-edit-actions">
            <Button type="button" variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingUserId === editingUser?.id}>
              {savingUserId === editingUser?.id ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;