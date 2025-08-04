
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  searchTerm: '',
  selectedCategory: 'meat',
  currentPage: 1,
  productsPerPage: 8,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
  },
});

export const { setSearchTerm, setSelectedCategory, setCurrentPage, setProducts } =
  productSlice.actions;

// Selectors - now memoized

// Base selector: extract products slice
const selectSelf = (state) => state.products;
console.log(selectSelf);

//  Memoized: filtered products
export const selectFilteredProducts = createSelector(
  [selectSelf],
  ({ products, searchTerm, selectedCategory }) => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'meat' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }
);

//  Memoized: current page of products
export const selectCurrentProducts = createSelector(
  [selectFilteredProducts, selectSelf],
  (filteredProducts, { currentPage, productsPerPage }) => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }
);

// Memoized: total pages
export const selectTotalPages = createSelector(
  [selectFilteredProducts, selectSelf],
  (filteredProducts, { productsPerPage }) => {
    return Math.ceil(filteredProducts.length / productsPerPage);
  }
);

export default productSlice.reducer;






// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   products: [
    
//   ],
//   searchTerm: '',
//   selectedCategory: 'All',
//   currentPage: 1,
//   productsPerPage: 8
// };

// const productSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     setSearchTerm: (state, action) => {
//       state.searchTerm = action.payload;
//     },
//     setSelectedCategory: (state, action) => {
//       state.selectedCategory = action.payload;
//       state.currentPage = 1;
//     },
//     setCurrentPage: (state, action) => {
//       state.currentPage = action.payload;
//     },
//     setProducts: (state, action) => {
//       state.products = action.payload;
//     },
//   }
// });

// export const { setSearchTerm, setSelectedCategory, setCurrentPage, setProducts } = productSlice.actions;

// export const selectFilteredProducts = (state) => {
//   const { products, searchTerm, selectedCategory } = state.products;
//   return products.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });
// };

// export const selectCurrentProducts = (state) => {
//   const { currentPage, productsPerPage } = state.products;
//   const filtered = selectFilteredProducts(state);
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   return filtered.slice(indexOfFirstProduct, indexOfLastProduct);
// };

// export const selectTotalPages = (state) => {
//   const filtered = selectFilteredProducts(state);
//   return Math.ceil(filtered.length / state.products.productsPerPage);
// };

// export default productSlice.reducer;