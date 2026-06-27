import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Plus, Copy, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { API } from '../lib/api';

const Entries = () => {
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);

const [repeatData, setRepeatData] = useState({
    source_date: "",
    target_date: new Date().toISOString().slice(0,10)
});
  const [editEntry, setEditEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMilkType, setFilterMilkType] = useState('');
  const [filterSession, setFilterSession] = useState('');

  const [formData, setFormData] = useState({
    customer_id: '',
    milk_type: 'Cow Milk',
    price: 60,
    quantity: 0,
    session: 'Morning',
    entry_date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, customersRes] = await Promise.all([
        axios.get(`${API}/entries`, { withCredentials: true }),
        axios.get(`${API}/customers`, { withCredentials: true }),
      ]);
      setEntries(entriesRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEntry) {
        await axios.put(`${API}/entries/${editEntry.id}`, formData, { withCredentials: true });
        toast.success('Entry updated successfully');
      } else {
        await axios.post(`${API}/entries`, formData, { withCredentials: true });
        toast.success('Entry created successfully');
      }
      setShowModal(false);
      setEditEntry(null);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`${API}/entries/${id}`, { withCredentials: true });
        toast.success('Entry deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };
  const handleRepeatEntries = async () => {
    try {

        await axios.post(
            `${API}/entries/repeat`,
            repeatData,
            { withCredentials: true }
        );

        toast.success("Entries repeated successfully");

        setShowRepeatModal(false);

        fetchData();

    } catch (error) {

        toast.error(
            error.response?.data?.message ||
            "Failed to repeat entries"
        );

    }
};

  const resetForm = () => {
    setFormData({
      customer_id: '',
      milk_type: 'Cow Milk',
      price: 60,
      quantity: 0,
      session: 'Morning',
      entry_date: new Date().toISOString().slice(0, 16),
    });
  };

  const openEditModal = (entry) => {
    setEditEntry(entry);
    setFormData({
      customer_id: entry.customer_id,
      milk_type: entry.milk_type,
      price: entry.price,
      quantity: entry.quantity,
      session: entry.session,
      entry_date: new Date(entry.entry_date).toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMilkType = filterMilkType ? entry.milk_type === filterMilkType : true;
    const matchesSession = filterSession ? entry.session === filterSession : true;
    return matchesSearch && matchesMilkType && matchesSession;
  });

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
    <h1 className="text-4xl font-light tracking-tighter text-white mb-2">
      Milk Entries
    </h1>
    <p className="text-slate-400">
      Manage daily milk entries and transactions
    </p>
  </div>

  <div className="flex gap-3">
    <button
      onClick={() => setShowRepeatModal(true)}
      className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-6 py-3 font-medium transition-all flex items-center gap-2"
    >
      <Copy className="w-5 h-5" />
      Repeat Entry
    </button>

    <button
      onClick={() => {
        resetForm();
        setEditEntry(null);
        setShowModal(true);
      }}
      data-testid="add-entry-button"
      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-3 font-medium glow-blue transition-all flex items-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Add Entry
    </button>
  </div>
</div>

            {/* Search and Filters */}
            <div className="glass-card p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="search-entries-input"
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-12 pr-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-500 transition-all outline-none"
                  />
                </div>
                <select
                  value={filterMilkType}
                  onChange={(e) => setFilterMilkType(e.target.value)}
                  data-testid="filter-milk-type"
                  className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                >
                  <option value="">All Milk Types</option>
                  <option value="Cow Milk">Cow Milk</option>
                  <option value="Buffalo Milk">Buffalo Milk</option>
                </select>
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  data-testid="filter-session"
                  className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                >
                  <option value="">All Sessions</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
                {(searchTerm || filterMilkType || filterSession) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterMilkType('');
                      setFilterSession('');
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg px-6 py-2.5 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Entries Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="entries-table">
                  <thead>
                    <tr className="bg-white/5 text-slate-300 font-medium text-sm border-b border-white/10">
                      <th className="py-4 px-4 text-left">Date</th>
                      <th className="py-4 px-4 text-left">Customer</th>
                      <th className="py-4 px-4 text-left">Milk Type</th>
                      <th className="py-4 px-4 text-left">Session</th>
                      <th className="py-4 px-4 text-right">Quantity (L)</th>
                      <th className="py-4 px-4 text-right">Price (₹)</th>
                      <th className="py-4 px-4 text-right">Revenue (₹)</th>
                      <th className="py-4 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">{entry.customer_name}</td>
                        <td className="py-4 px-4 text-sm text-slate-300">{entry.milk_type}</td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              entry.session === 'Morning'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}
                          >
                            {entry.session}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300 text-right font-mono">
                          {entry.quantity.toFixed(1)}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300 text-right font-mono">{entry.price}</td>
                        <td className="py-4 px-4 text-sm text-white text-right font-mono font-semibold">
                          {entry.revenue.toFixed(0)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(entry)}
                              data-testid={`edit-entry-${entry.id}`}
                              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              data-testid={`delete-entry-${entry.id}`}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEntries.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No entries found</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#0B1221] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              {editEntry ? 'Edit Entry' : 'Add New Entry'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="entry-form">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                Customer
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) })}
                required
                data-testid="entry-customer-select"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                  Milk Type
                </label>
                <select
                  value={formData.milk_type}
                  onChange={(e) => setFormData({ ...formData, milk_type: e.target.value })}
                  data-testid="entry-milk-type-select"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                >
                  <option value="Cow Milk">Cow Milk</option>
                  <option value="Buffalo Milk">Buffalo Milk</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                  Session
                </label>
                <select
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  data-testid="entry-session-select"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                  Price (₹)
                </label>
                <select
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  data-testid="entry-price-select"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                >
                  <option value={60}>₹60</option>
                  <option value={76}>₹76</option>
                  <option value={78}>₹78</option>
                  <option value={80}>₹80</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                  Quantity (L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  required
                  data-testid="entry-quantity-input"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                required
                data-testid="entry-date-input"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                data-testid="entry-submit-button"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2.5 font-medium glow-blue transition-all"
              >
                {editEntry ? 'Update Entry' : 'Add Entry'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditEntry(null);
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
                  <Dialog
  open={showRepeatModal}
  onOpenChange={setShowRepeatModal}
>
  <DialogContent className="bg-[#0B1221] border border-white/10 text-white max-w-md">
    <DialogHeader>
      <DialogTitle>Repeat Entries</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <label className="block mb-2">Copy From Date</label>
        <input
          type="date"
          value={repeatData.source_date}
          onChange={(e) =>
            setRepeatData({
              ...repeatData,
              source_date: e.target.value,
            })
          }
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
        />
      </div>

      <div>
        <label className="block mb-2">Copy To Date</label>
        <input
          type="date"
          value={repeatData.target_date}
          onChange={(e) =>
            setRepeatData({
              ...repeatData,
              target_date: e.target.value,
            })
          }
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleRepeatEntries}>
          Repeat
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowRepeatModal(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Entries;
