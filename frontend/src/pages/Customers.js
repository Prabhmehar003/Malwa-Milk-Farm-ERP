import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Plus, Edit, Trash2, Search, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { API } from '../lib/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get(`${API}/customers`, { withCredentials: true });
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCustomer) {
        await axios.put(`${API}/customers/${editCustomer.id}`, formData, { withCredentials: true });
        toast.success('Customer updated successfully');
      } else {
        await axios.post(`${API}/customers`, formData, { withCredentials: true });
        toast.success('Customer added successfully');
      }
      setShowModal(false);
      setEditCustomer(null);
      fetchCustomers();
      resetForm();
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`${API}/customers/${id}`, { withCredentials: true });
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' });
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowModal(true);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 min-h-screen bg-[#050B14] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-[#050B14] p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-light tracking-tighter text-white mb-2">Customers</h1>
                <p className="text-slate-400">Manage your customer database</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setEditCustomer(null);
                  setShowModal(true);
                }}
                data-testid="add-customer-button"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-3 font-medium glow-blue transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Customer
              </button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-customers-input"
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-12 pr-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="customers-grid">
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{customer.name.charAt(0)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        data-testid={`edit-customer-${customer.id}`}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        data-testid={`delete-customer-${customer.id}`}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{customer.name}</h3>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-400">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="glass-card p-12 text-center">
                <p className="text-slate-400">No customers found</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#0B1221] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              {editCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="customer-form">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="customer-name-input"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-500 transition-all outline-none"
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="customer-phone-input"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-500 transition-all outline-none"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                data-testid="customer-address-input"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-500 transition-all outline-none resize-none"
                placeholder="Customer address"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                data-testid="customer-submit-button"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2.5 font-medium glow-blue transition-all"
              >
                {editCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditCustomer(null);
                  resetForm();
                }}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
