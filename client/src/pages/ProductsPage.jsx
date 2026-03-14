import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX } from 'react-icons/fi';
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
    <div className="bg-gray-50 min-h-screen py-8">
      <Helmet>
        <title>All Products | Ecom.</title>
      </Helmet>

      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <span className="font-semibold text-gray-900">
              {data?.total || 0} Products
            </span>
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center text-sm font-medium text-primary-600 bg-primary-50 px-4 py-2 rounded-lg"
            >
              <FiFilter className="mr-2" />
              Filters & Sort
            </button>
          </div>

          {/* Desktop Sidebar & Mobile Drawer */}
          <div className={`
            fixed inset-0 z-50 bg-white p-6 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:z-0 md:bg-transparent md:p-0 md:w-64 flex-shrink-0
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold">Filters</h2>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8 sticky top-24">
              {/* Search */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={keyword}
                  onChange={(e) => handleFilterChange(setKeyword, e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
                <ul className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleFilterChange(setCategory, cat === 'All Categories' ? '' : cat)}
                        className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                          (category === cat || (!category && cat === 'All Categories'))
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
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
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Sort By</h3>
                <select
                  value={sort}
                  onChange={(e) => handleFilterChange(setSort, e.target.value)}
                  className="input-field w-full"
                >
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Clear */}
              {(category || keyword || sort !== 'newest') && (
                <button 
                  onClick={clearFilters}
                  className="w-full btn-secondary py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200"
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
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {category || keyword ? 'Search Results' : 'Explore Products'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Showing {data?.total || 0} premium items</p>
              </div>
              
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => handleFilterChange(setSort, e.target.value)}
                  className="bg-white border text-sm border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                >
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>



            {/* Product Grid */}
            {isLoading ? (
              <div className="flex justify-center py-32">
                <Spinner className="h-12 w-12 text-primary-600" />
              </div>
            ) : isError ? (
              <div className="bg-red-50 p-6 rounded-xl text-center border border-red-100">
                <p className="text-red-600 font-medium">Failed to load products. Please try again later.</p>
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center border border-gray-100 shadow-sm">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search keywords.</p>
                <button onClick={clearFilters} className="btn-primary px-6 py-2">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {data.products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {data?.pages > 1 && (
                  <div className="mt-12 flex justify-center">
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
                      containerClassName="flex gap-2 items-center text-sm font-medium"
                      pageClassName=""
                      pageLinkClassName="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      previousClassName=""
                      previousLinkClassName="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      nextClassName=""
                      nextLinkClassName="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      activeLinkClassName="!bg-primary-600 !text-white !border-primary-600 hover:!bg-primary-700"
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
