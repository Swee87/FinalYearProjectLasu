import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../services/AdminRoutes/ProductsManagement";
import { toast } from "react-toastify";
import { 
  selectCurrentProducts, 
  selectTotalPages,
  setSearchTerm,
  setSelectedCategory,
  setCurrentPage,
  setProducts
} from "./features/productSlice";
import { addToCart, selectCartItems } from "./features/cartSlice";
import { Icon } from "./Icon";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const categories = ['fruits', 'vegetables', 'dairy', 'bakery', 'meat'];

export function ProductsPage() {
  const dispatch = useDispatch();
  const currentProducts = useSelector(selectCurrentProducts);
  const totalPages = useSelector(selectTotalPages);
  // const [searchTerm, setSearchTermLocal] = useState("");
  // const [selectedCategory, setSelectedCategoryLocal] = useState("All");
  // const [currentPage, setCurrentPageLocal] = useState(1);
  const searchTerm = useSelector((state) => state.products.searchTerm);
const selectedCategory = useSelector((state) => state.products.selectedCategory);
const currentPage = useSelector((state) => state.products.currentPage);

  const cartItems = useSelector(selectCartItems);

  const {
    isLoading,
    isError,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
    staleTime: 5 * 60 * 1000, // 5 mins
    cacheTime: 10 * 60 * 1000, // 10 mins
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fixed: useEffect moved to top level
  useEffect(() => {
    if (data) {
      dispatch(setProducts(data));
    }
  }, [data, dispatch]);

  //  Show error toast only when error occurs
  useEffect(() => {
    if (isError) {
      toast.error(`Error fetching products: ${error.message || error}`);
    }
  }, [isError, error]);

 const handleSearch = (e) => {
  dispatch(setSearchTerm(e.target.value));
};


  const handleCategory = (cat) => {
    dispatch(setSelectedCategory(cat));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handleAdd = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl mt-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">Our Products</h1>

        <div className="mb-10 bg-white rounded-xl shadow-lg p-6">
          <Carousel
            responsive={responsive}
            autoPlay
            infinite
            keyBoardControl
            itemClass="px-4"
            containerClass="-mx-4"
          >
            {currentProducts.map((product) => (
              <div key={product._id} className="h-64 overflow-hidden rounded-xl shadow-md">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product) => {
            const isInCart = cartItems.some(item => item._id === product._id);
            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-lg text-gray-800">{product.name}</h2>
                  <p className="text-blue-600 font-semibold mt-1">
                    ${product.price.toFixed(2)} / {product.unit}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{product.category}</p>
                  
                  <button
                    onClick={() => handleAdd(product)}
                    disabled={isInCart}
                    className={`mt-4 w-full py-2 rounded-lg font-medium transition-colors ${
                      isInCart 
                        ? "bg-blue-100 text-blue-700 cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isInCart ? "✓ Added to Cart" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {currentProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">No products found. Try a different search.</p>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Icon />
    </div>
  );
}