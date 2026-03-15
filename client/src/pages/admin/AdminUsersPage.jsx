import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Search, Trash2, Shield, User, AlertCircle } from 'lucide-react';

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users');
      return res.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await axiosInstance.put(`/users/${id}/role`, { role });
      return res.data;
    },
    onMutate: ({ id }) => setUpdatingId(id),
    onSuccess: (_, { role }) => {
      toast.success(`Role updated to ${role}`);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
    onSettled: () => setUpdatingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/users/${id}`);
    },
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleDelete = (id, name) => {
    if (id === currentUser?._id || id === currentUser?.id) {
      toast.error("You can't delete your own account.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const allUsers = data?.users || [];

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q)
    );
  }, [allUsers, search]);

  // Summary stats
  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const verifiedCount = allUsers.filter(u => u.isVerified).length;

  return (
    <div>
      <div className="mb-8 border-b-2 border-primary-500 pb-5 inline-block w-fit min-w-full sm:min-w-[50%]">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Users</h1>
        <p className="text-gray-700 text-sm mt-1 font-bold">Manage user accounts and permission levels.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Users', value: allUsers.length, color: 'text-gray-800 bg-surface-100 border-surface-300' },
          { label: 'Admins', value: adminCount, color: 'text-sky-700 bg-sky-100 border-sky-200' },
          { label: 'Verified', value: verifiedCount, color: 'text-primary-700 bg-primary-100 border-primary-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-[1.5rem] border-2 border-surface-300 shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{label}</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border shadow-sm ${color}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border-2 border-surface-300 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b-2 border-surface-300 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-surface-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 h-4 w-4" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-bold border-2 border-surface-300 rounded-xl focus:outline-none focus:ring-0 focus:border-primary-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl shadow-sm basis-auto">
            <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
            <span>Role changes take effect immediately</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-10 w-10 text-primary-600" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-600 text-xs font-black uppercase tracking-widest border-b-2 border-surface-300">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Joined</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isSelf = user._id === currentUser?._id || user._id === currentUser?.id;
                    return (
                      <tr key={user._id} className={`hover:bg-surface-50/50 transition-colors ${isSelf ? 'bg-primary-50/30' : ''}`}>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0 border border-surface-300 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-primary-100 border border-primary-200 shadow-sm flex items-center justify-center text-primary-700 font-black text-lg flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate">
                                {user.name}
                                {isSelf && <span className="ml-2 text-[10px] uppercase tracking-widest text-primary-600 font-black bg-white px-2 py-0.5 rounded-lg border border-primary-100 shadow-sm">You</span>}
                              </p>
                              <p className="text-[10px] text-gray-700 font-bold uppercase tracking-wider truncate mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-sm font-bold text-gray-700">
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            user.isVerified
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg border shadow-sm ${user.role === 'admin' ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-surface-50 border-surface-300 text-gray-700'}`}>
                            {user.role === 'admin' ? (
                              <Shield className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
                            ) : (
                              <User className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
                            )}
                            </div>
                            <select
                              disabled={updatingId === user._id || isSelf}
                              value={user.role}
                              onChange={(e) => updateRoleMutation.mutate({ id: user._id, role: e.target.value })}
                              className={`text-xs uppercase tracking-widest font-black rounded-xl px-3 py-1.5 border-2 shadow-sm transition-all focus:outline-none focus:ring-0 focus:border-gray-900 ${
                                user.role === 'admin'
                                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                                  : 'bg-white border-surface-300 text-gray-800'
                              } ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'}`}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            {updatingId === user._id && (
                              <Spinner className="h-4 w-4 text-primary-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button
                            disabled={isSelf}
                            onClick={() => handleDelete(user._id, user.name)}
                            className={`inline-flex items-center justify-center p-2.5 rounded-xl border-2 text-red-500 border-red-100 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-600 shadow-sm transition-colors ${
                              isSelf ? 'opacity-30 cursor-not-allowed grayscale' : ''
                            }`}
                            title={isSelf ? "Can't delete your own account" : 'Delete User'}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-sm font-bold text-gray-600">
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
