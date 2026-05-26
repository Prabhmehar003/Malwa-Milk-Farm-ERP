import React from 'react';
import Sidebar from '../components/Sidebar';
import { User, Shield, Bell, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-[#050B14] p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tighter text-white mb-2">Settings</h1>
              <p className="text-slate-400">Manage your account and preferences</p>
            </div>

            {/* User Profile */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-white">{user?.name}</h2>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">Security</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Manage your password and security settings
                </p>
                <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg px-6 py-2.5 transition-all">
                  Change Password
                </button>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">Notifications</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Email notifications</span>
                    <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Payment reminders</span>
                    <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Low stock alerts</span>
                    <input type="checkbox" className="w-5 h-5 rounded" />
                  </label>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">Data Management</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Backup and restore your farm data
                </p>
                <div className="flex gap-3">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2.5 font-medium glow-blue transition-all">
                    Backup Data
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg px-6 py-2.5 transition-all">
                    Restore Data
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 mt-6 border-red-500/30">
              <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-400 mb-4">
                Permanently delete your account and all associated data
              </p>
              <button className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-6 py-2.5 font-medium transition-all">
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;