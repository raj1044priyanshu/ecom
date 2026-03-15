import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Filter, X, SlidersHorizontal, Search as SearchIcon } from 'lucide-react';
import axiosInstance from '../api/axiosInstance.js';
import ProductCard from '../components/product/ProductCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ReactPaginate from 'react-paginate';

const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Beauty', 'Toys', 'Other'];
const SORTS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'top_rated', label: 'Top Rated' },
];

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // State from URL
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state to URL and trigger fetch
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page);
    if (category && category !== 'All Categories') params.set('category', category);
    if (keyword) params.set('keyword', keyword);
    if (sort !== 'newest') params.set('sort', sort);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [page, category, keyword, sort, navigate]);

  // Fetch products
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { page, category, keyword, sort }],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.append('page', page);
      p.append('limit', 12);
      if (category && category !== 'All Categories') p.append('category', category);
      if (keyword) p.append('keyword', keyword);
      if (sort) p.append('sort', sort);
      
      const res = await axiosInstance.get(`/products?${p.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const handlePageClick = (event) => {
    setPage(event.selected + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1); // Reset page on filter change
    setIsMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setCategory('');
    setKeyword('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="section-cream min-h-screen py-8">
      <Helmet>
        <title>All Products | Ecom.</title>
      </Helmet>

      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-surface-300">
            <span className="font-semibold text-gray-900 text-sm">
              {data?.total || 0} Products
            </span>
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center text-sm font-semibold text-primary-700 bg-primary-100 px-4 py-2 rounded-xl gap-2 hover:bg-primary-200 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
              Filters
            </button>
          </div>

          {/* Desktop Sidebar & Mobile Drawer */}
          <div className={`
            fixed inset-0 z-50 bg-white p-6 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:z-0 md:bg-transparent md:p-0 md:w-64 flex-shrink-0
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 bg-surface-100 rounded-xl text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8 sticky top-24">
              {/* Search */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 mx-1 uppercase tracking-wider mb-3">Search</h3>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={keyword}
                  onChange={(e) => handleFilterChange(setKeyword, e.target.value)}
                  className="input-field shadow-sm"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 mx-1 uppercase tracking-wider mb-3">Categories</h3>
                <ul className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleFilterChange(setCategory, cat === 'All Categories' ? '' : cat)}
                        className={`w-full text-left font-medium text-sm py-2 px-3 rounded-xl transition-colors ${
                          (category === cat || (!category && cat === 'All Categories'))
                            ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100 shadow-sm'
                            : 'text-gray-800 hover:bg-surface-100 hover:text-gray-900 border border-transparent'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort By (Mobile only, inside drawer) */}
              <div className="md:hidden">
                <h3 className="text-xs font-bold text-gray-900 mx-1 uppercase tracking-wider mb-3">Sort By</h3>
                <select
                  value={sort}
                  onChange={(e) => handleFilterChange(setSort, e.target.value)}
                  className="input-field w-full shadow-sm font-medium"
                >
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Clear */}
              {(category || keyword || sort !== 'newest') && (
                <button 
                  onClick={clearFilters}
                  className="w-full btn-secondary py-2 text-sm font-bold text-red-600 hover:text-red-700 hover:border-red-200 border-surface-300 shadow-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Desktop Header & Sort */}
            <div className="hidden md:flex justify-between items-end mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {category || keyword ? 'Search Results' : 'Explore Products'}
                </h1>
                <p className="text-sm font-medium text-gray-700 mt-1.5">Showing {data?.total || 0} premium items</p>
              </div>
              
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm font-bold text-gray-800">Sort by:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => handleFilterChange(setSort, e.target.value)}
                  className="bg-white border text-sm font-medium border-surface-300 rounded-xl py-2 pl-3 pr-10 focus:ring-primary-500 focus:border-primary-500 shadow-sm outline-none transition-colors hover:border-surface-300"
                >
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="flex justify-center py-32">
                <Spinner className="h-12 w-12 text-primary-500" />
              </div>
            ) : isError ? (
              <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100 shadow-sm">
                <p className="text-red-600 font-bold">Failed to load products. Please try again later.</p>
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="bg-white p-16 rounded-[2rem] text-center border border-surface-300 shadow-sm">
                <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="h-10 w-10 text-gray-600" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-700 font-medium mb-8">Try adjusting your filters or search keywords.</p>
                <button onClick={clearFilters} className="btn-primary px-8 py-3 shadow-lg shadow-primary-500/20">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {data.products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {data?.pages > 1 && (
                  <div className="mt-14 flex justify-center">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel="Next →"
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={3}
                      marginPagesDisplayed={1}
                      pageCount={data.pages}
                      previousLabel="← Prev"
                      renderOnZeroPageCount={null}
                      forcePage={page - 1} // 0-indexed
                      containerClassName="flex gap-2 items-center text-sm font-bold"
                      pageClassName=""
                      pageLinkClassName="w-10 h-10 flex items-center justify-center rounded-xl border border-surface-300 bg-white text-gray-800 hover:bg-surface-50 hover:border-surface-300 shadow-sm transition-all"
                      previousClassName=""
                      previousLinkClassName="px-4 py-2 rounded-xl border border-surface-300 bg-white text-gray-800 hover:bg-surface-50 hover:border-surface-300 shadow-sm transition-all"
                      nextClassName=""
                      nextLinkClassName="px-4 py-2 rounded-xl border border-surface-300 bg-white text-gray-800 hover:bg-surface-50 hover:border-surface-300 shadow-sm transition-all"
                      activeLinkClassName="!bg-primary-600 !text-white !border-primary-600 hover:!bg-primary-700 shadow-md shadow-primary-500/20"
                      disabledLinkClassName="opacity-50 cursor-not-allowed hidden"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
