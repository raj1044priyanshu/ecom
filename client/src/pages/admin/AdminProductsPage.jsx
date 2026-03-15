import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Plus, Search, Upload, Code2, Download, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import toast from 'react-hot-toast';
import ReactPaginate from 'react-paginate';

const SAMPLE_JSON = `[
  {
    "name": "Sample Product",
    "price": 1999,
    "discountPrice": 1499,
    "category": "Electronics",
    "brand": "BrandName",
    "stock": 50,
    "description": "Premium wireless headphones with noise cancellation",
    "tags": "electronics;audio;wireless",
    "isFeatured": true,
    "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"]
  }
]`;

const BulkImportPanel = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('csv');
  const [csvFile, setCsvFile] = useState(null);
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const csvMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('file', csvFile);
      const res = await axiosInstance.post('/products/bulk-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResult({ type: 'success', data });
      toast.success(`Imported ${data.imported} products!`);
      onSuccess();
    },
    onError: (err) => {
      const d = err.response?.data;
      setResult({ type: 'error', data: d });
      toast.error(d?.message || 'CSV import failed');
    },
  });

  const jsonMutation = useMutation({
    mutationFn: async () => {
      let parsed;
      try { parsed = JSON.parse(jsonText); } catch { throw new Error('Invalid JSON format'); }
      const res = await axiosInstance.post('/products/bulk-json', { products: parsed });
      return res.data;
    },
    onSuccess: (data) => {
      setResult({ type: 'success', data });
      toast.success(`Imported ${data.imported} products!`);
      onSuccess();
    },
    onError: (err) => {
      const d = err.response?.data;
      setResult({ type: 'error', data: d });
      toast.error(d?.message || 'JSON import failed');
    },
  });

  const handleDownloadTemplate = async () => {
    try {
      const res = await axiosInstance.get('/products/bulk-template', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ecom_products_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  const isPending = csvMutation.isPending || jsonMutation.isPending;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Bulk Import Products</h2>
            <p className="text-xs text-gray-700 mt-0.5">Upload CSV (comma separated) or paste JSON to add multiple products. Supports image URLs using "images" field (split by ; in CSV).</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 border border-gray-200 px-3 py-2 rounded-xl hover:bg-surface-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> CSV Template
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-surface-100 p-1 rounded-xl w-fit">
          {[
            { id: 'csv', icon: FileText, label: 'Upload CSV' },
            { id: 'json', icon: Code2, label: 'JSON / API' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setResult(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'csv' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                csvFile ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300 hover:bg-surface-50'
              }`}
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-600" strokeWidth={1.5} />
              {csvFile ? (
                <div>
                  <p className="text-sm font-semibold text-primary-600">{csvFile.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{(csvFile.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-gray-800">Click to upload CSV file</p>
                  <p className="text-xs text-gray-600 mt-1">Max 2MB · .csv format</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => { setCsvFile(e.target.files[0]); setResult(null); }}
                className="hidden"
              />
            </div>
            <div className="bg-surface-50 rounded-xl p-3 text-xs text-gray-700">
              <p className="font-semibold text-gray-800 mb-1">Required columns:</p>
              <code className="text-primary-600">name, price, category, stock</code>
              <p className="mt-1">Optional: <code className="text-gray-800">discountPrice, brand, description, tags (semicolon-separated), isFeatured (true/false)</code></p>
            </div>
            <button
              onClick={() => csvMutation.mutate()}
              disabled={!csvFile || isPending}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {csvMutation.isPending ? 'Importing...' : 'Import from CSV'}
            </button>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-2">JSON Array of Products</label>
              <textarea
                value={jsonText}
                onChange={(e) => { setJsonText(e.target.value); setResult(null); }}
                rows={10}
                className="w-full font-mono text-xs bg-stone-950 text-surface-100 p-4 rounded-xl border border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-y"
                placeholder="Paste JSON array here..."
              />
            </div>
            <button
              onClick={() => jsonMutation.mutate()}
              disabled={!jsonText.trim() || isPending}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {jsonMutation.isPending ? 'Importing...' : 'Import from JSON'}
            </button>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className={`mt-4 rounded-xl p-4 border ${result.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              {result.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${result.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {result.data?.message}
                </p>
                {result.type === 'success' && (
                  <p className="text-xs text-green-600 mt-0.5">
                    {result.data.imported} imported · {result.data.skipped || 0} skipped
                  </p>
                )}
                {result.data?.errors?.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {result.data.errors.slice(0, 5).map((e, i) => (
                      <li key={i} className="text-xs text-red-600">{e}</li>
                    ))}
                    {result.data.errors.length > 5 && (
                      <li className="text-xs text-red-400">...and {result.data.errors.length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
              <button onClick={() => setResult(null)} className="text-gray-600 hover:text-gray-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminProductsPage = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', page, keyword],
    queryFn: async () => {
      const res = await axiosInstance.get(`/products?pageNumber=${page}&keyword=${keyword}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await axiosInstance.delete(`/products/${id}`); },
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

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    setShowBulkImport(false);
  };

  const products = data?.products || [];
  const pages = data?.pages || 1;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Products</h1>
          <p className="text-gray-700 text-sm">Manage your store's inventory and listings.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors border ${
              showBulkImport 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-white text-gray-800 border-gray-200 hover:bg-surface-50'
            }`}
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </button>
          <Link to="/admin/products/new" className="btn-primary py-2.5 px-5 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {showBulkImport && <BulkImportPanel onSuccess={handleImportSuccess} />}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-surface-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 h-4 w-4" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-white"
            />
          </div>
          <span className="text-xs text-gray-600 hidden sm:block">{data?.total || 0} products</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-medium">Product</th>
                  <th className="py-3.5 px-5 font-medium">Price</th>
                  <th className="py-3.5 px-5 font-medium">Category</th>
                  <th className="py-3.5 px-5 font-medium">Stock</th>
                  <th className="py-3.5 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-surface-50/50 transition-colors group">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]?.url || 'https://placehold.co/60x60'}
                            alt={product.name}
                            className="w-11 h-11 rounded-xl object-cover aspect-square border border-gray-100"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-600 truncate w-44" title={product._id}>#{product._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-sm font-semibold text-gray-900">
                        {formatCurrency(product.discountPrice || product.price)}
                        {product.discountPrice > 0 && (
                          <p className="text-xs text-gray-600 line-through font-normal">{formatCurrency(product.price)}</p>
                        )}
                      </td>
                      <td className="py-3 px-5 text-sm text-gray-800">{product.category}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' :
                          product.stock > 0 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right space-x-1">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-gray-600 text-sm">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-surface-50/50">
            <ReactPaginate
              breakLabel="..."
              nextLabel="Next"
              onPageChange={(e) => setPage(e.selected + 1)}
              pageRangeDisplayed={3}
              pageCount={pages}
              previousLabel="Prev"
              forcePage={page - 1}
              renderOnZeroPageCount={null}
              className="flex items-center gap-1.5"
              pageLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-800 hover:bg-surface-100 transition-colors"
              activeLinkClassName="bg-primary-600 text-white hover:bg-primary-700 hover:text-white"
              previousLinkClassName="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-surface-100 transition-colors"
              nextLinkClassName="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-surface-100 transition-colors"
              disabledClassName="opacity-40 cursor-not-allowed pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
