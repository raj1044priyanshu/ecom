import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiShield, FiUser, FiAlertCircle } from 'react-icons/fi';

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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">Manage user accounts and permission levels.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: allUsers.length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Admins', value: adminCount, color: 'text-purple-600 bg-purple-50' },
          { label: 'Verified', value: verifiedCount, color: 'text-green-600 bg-green-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${color}`}>
              {value}
            </div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            <FiAlertCircle className="text-sm flex-shrink-0" />
            <span>Be careful: role changes take effect immediately.</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8 text-primary-600" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-6 font-medium">User</th>
                  <th className="py-3 px-6 font-medium">Joined</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                  <th className="py-3 px-6 font-medium">Role</th>
                  <th className="py-3 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isSelf = user._id === currentUser?._id || user._id === currentUser?.id;
                    return (
                      <tr key={user._id} className={`hover:bg-gray-50/50 transition-colors ${isSelf ? 'bg-primary-50/30' : ''}`}>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                                {isSelf && <span className="ml-2 text-xs text-primary-600 font-medium">(you)</span>}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-500">
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isVerified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {user.isVerified ? '✓ Verified' : '⚠ Unverified'}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' ? (
                              <FiShield className="text-purple-500 flex-shrink-0" />
                            ) : (
                              <FiUser className="text-gray-400 flex-shrink-0" />
                            )}
                            <select
                              disabled={updatingId === user._id || isSelf}
                              value={user.role}
                              onChange={(e) => updateRoleMutation.mutate({ id: user._id, role: e.target.value })}
                              className={`text-sm rounded-lg px-2.5 py-1 border transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                                user.role === 'admin'
                                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              } ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            {updatingId === user._id && (
                              <Spinner className="h-3.5 w-3.5 text-primary-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <button
                            disabled={isSelf}
                            onClick={() => handleDelete(user._id, user.name)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 transition-colors ${
                              isSelf ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title={isSelf ? "Can't delete your own account" : 'Delete User'}
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-sm text-gray-400">
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
