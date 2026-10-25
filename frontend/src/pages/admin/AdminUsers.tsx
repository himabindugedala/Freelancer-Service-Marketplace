import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle2, UserX, UserCheck } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { User } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter !== 'all') params.role = roleFilter;

      const res = await adminApi.getUsers(params);
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userToToggle: User) => {
    if (userToToggle.role === 'admin') {
      alert('Administrator accounts cannot be suspended.');
      return;
    }
    try {
      const res = await adminApi.toggleUserStatus(userToToggle._id);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userToToggle._id ? res.data : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          User Directory & Account Controls
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Inspect registered clients, freelancers, and manage account statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="relative w-full sm:max-w-md"
        >
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="all">All Roles</option>
          <option value="client">Clients Only</option>
          <option value="freelancer">Freelancers Only</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      ${u.walletBalance || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Reactivate
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
