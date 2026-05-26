import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Download, FileText, Table2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { API } from '../lib/api';

const Reports = () => {
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, customersRes, pendingRes] = await Promise.all([
        axios.get(`${API}/entries`, { withCredentials: true }),
        axios.get(`${API}/customers`, { withCredentials: true }),
        axios.get(`${API}/payments/pending`, { withCredentials: true }),
      ]);
      setEntries(entriesRes.data);
      setCustomers(customersRes.data);
      setPendingPayments(pendingRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (!startDate && !endDate) return true;
    const entryDate = new Date(entry.entry_date);
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date('2099-12-31');
    return entryDate >= start && entryDate <= end;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('MALWA MILK FARM - Entries Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    if (startDate || endDate) {
      doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'End'}`, 14, 34);
    }

    const tableData = filteredEntries.map((entry) => [
      new Date(entry.entry_date).toLocaleDateString(),
      entry.customer_name,
      entry.milk_type,
      entry.session,
      entry.quantity.toFixed(1),
      `₹${entry.price}`,
      `₹${entry.revenue.toFixed(0)}`,
    ]);

    doc.autoTable({
      head: [['Date', 'Customer', 'Milk Type', 'Session', 'Qty (L)', 'Price', 'Revenue']],
      body: tableData,
      startY: startDate || endDate ? 38 : 32,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    const totalRevenue = filteredEntries.reduce((sum, e) => sum + e.revenue, 0);
    const totalQuantity = filteredEntries.reduce((sum, e) => sum + e.quantity, 0);
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Quantity: ${totalQuantity.toFixed(1)} L`, 14, finalY);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(0)}`, 14, finalY + 8);

    doc.save('malwa-milk-report.pdf');
    toast.success('Report exported to PDF');
  };

  const exportToExcel = () => {
    const data = filteredEntries.map((entry) => ({
      Date: new Date(entry.entry_date).toLocaleDateString(),
      Customer: entry.customer_name,
      'Milk Type': entry.milk_type,
      Session: entry.session,
      'Quantity (L)': entry.quantity,
      'Price (₹)': entry.price,
      'Revenue (₹)': entry.revenue,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries');
    XLSX.writeFile(workbook, 'malwa-milk-report.xlsx');
    toast.success('Report exported to Excel');
  };

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

  const totalRevenue = filteredEntries.reduce((sum, e) => sum + e.revenue, 0);
  const totalQuantity = filteredEntries.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-[#050B14] p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tighter text-white mb-2">Reports</h1>
              <p className="text-slate-400">Export and analyze your dairy data</p>
            </div>

            {/* Date Range Filter */}
            <div className="glass-card p-6 mb-6">
              <h2 className="text-lg font-medium text-white mb-4">Filter by Date Range</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="report-start-date"
                  className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="report-end-date"
                  className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                />
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg px-6 py-2.5 transition-all"
                >
                  Clear Filter
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6">
                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Total Entries</h3>
                <p className="text-3xl font-bold font-mono text-white">{filteredEntries.length}</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Total Quantity</h3>
                <p className="text-3xl font-bold font-mono text-white">{totalQuantity.toFixed(1)} L</p>
              </div>
              <div className="glass-card p-6 border-[#D4AF37] glow-gold">
                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold font-mono text-gradient-gold">₹{totalRevenue.toFixed(0)}</p>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="glass-card p-6 mb-8">
              <h2 className="text-lg font-medium text-white mb-4">Export Options</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={exportToPDF}
                  data-testid="export-pdf-button"
                  className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-6 py-3 font-medium transition-all flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Export to PDF
                </button>
                <button
                  onClick={exportToExcel}
                  data-testid="export-excel-button"
                  className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-6 py-3 font-medium transition-all flex items-center gap-2"
                >
                  <Table2 className="w-5 h-5" />
                  Export to Excel
                </button>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-medium text-white mb-4">Pending Payments</h2>
              {pendingPayments.length > 0 ? (
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div key={payment.customer_id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{payment.customer_name}</p>
                        <p className="text-sm text-slate-400">Total Due: ₹{payment.total_due.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Paid: ₹{payment.total_paid.toFixed(0)}</p>
                        <p className="text-lg font-bold text-red-400">Balance: ₹{payment.balance.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No pending payments</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
