// src/components/DeleteConfirmation.jsx
import React from 'react';

export const DeleteConfirmation = ({ isOpen, onClose, onConfirm, product, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-red-100 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-red-700">Confirm Deletion</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-6">
            {product?.image && (
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-16 w-16 object-cover rounded-lg mr-4 border border-red-100"
              />
            )}
            <div>
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <span className="font-semibold">{product?.name}</span>?
              </p>
              <p className="text-sm text-gray-500">
                This product will be permanently removed from the system.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-75"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-75"
            >
              {isLoading ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

