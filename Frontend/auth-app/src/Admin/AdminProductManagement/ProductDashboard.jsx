// src/components/ProductDashboard.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {ProductTable }from './ProductTable';
import{ ProductForm} from './ProductForm';
import {DeleteConfirmation} from './DeleteConfirmation';
import {Filters }from './Filters';
import { getProducts, deleteProduct } from '../../services/AdminRoutes/ProductsManagement';
// import  Logo from './assets/react.svg';
export const ProductDashboard = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: '',
    soldOut: '',
    stock: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch products with React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    keepPreviousData: true,
    staleTime: 30000
  });

  // Delete mutation
const deleteMutation = useMutation({
  mutationFn: deleteProduct,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setIsDeleteOpen(false);
  },
  onError: (error) => {
    console.error('Error deleting product:', error.message || error);
  }
});


  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* <Logo className="h-10 w-10" /> */}
            <h1 className="text-2xl font-bold">Product Manager</h1>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            + Add Product
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Filters */}
          <Filters filters={filters} onFilterChange={handleFilterChange} />
          
          {/* Product Table */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-red-500">
                No products found. Please try again.
              </div>
            ) : (
              <>
                <ProductTable 
                  products={data?.data || []} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 border-t border-blue-100 pt-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(filters.page * filters.limit, data?.total || 0)}
                    </span>{' '}
                    of <span className="font-medium">{data?.total || 0}</span> products
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className={`px-4 py-2 rounded-md ${
                        filters.page === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page * filters.limit >= (data?.total || 0)}
                      className={`px-4 py-2 rounded-md ${
                        filters.page * filters.limit >= (data?.total || 0)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProductForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={selectedProduct}
      />

      <DeleteConfirmation 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedProduct?._id)}
        product={selectedProduct}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};
