import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import toast from 'react-hot-toast';
import ReactPaginate from 'react-paginate';

const AdminProductsPage = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', page, keyword],
    queryFn: async () => {
      const res = await axiosInstance.get(`/products?pageNumber=${page}&keyword=${keyword}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const products = data?.products || [];
  const pages = data?.pages || 1;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Manage your store's inventory and listings.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary py-2.5 px-6 flex items-center justify-center gap-2">
          <FiPlus />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-medium">Product</th>
                  <th className="py-4 px-6 font-medium">Price</th>
                  <th className="py-4 px-6 font-medium">Category</th>
                  <th className="py-4 px-6 font-medium">Stock</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.images[0]?.url || 'https://via.placeholder.com/150'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover aspect-square border border-gray-200 shadow-sm"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate w-48" title={product._id}>ID: {product._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-600">
                        {product.category}
                      </td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${product.stock > 10 ? 'bg-green-100 text-green-800' : 
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right space-x-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <ReactPaginate
              breakLabel="..."
              nextLabel="Next →"
              onPageChange={(e) => setPage(e.selected + 1)}
              pageRangeDisplayed={3}
              pageCount={pages}
              previousLabel="← Prev"
              forcePage={page - 1}
              renderOnZeroPageCount={null}
              className="flex items-center gap-2"
              pageLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              activeLinkClassName="bg-primary-600 text-white hover:bg-primary-700 hover:text-white"
              previousLinkClassName="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              nextLinkClassName="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              disabledClassName="opacity-50 cursor-not-allowed pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
