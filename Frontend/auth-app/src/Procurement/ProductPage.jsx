import React, { useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { toast } from "react-toastify";
import { useCart } from "./CartContext";
import Navbar from "./Navbar";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
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

const productsData = [
  {
    id: 1,
    name: "Organic Fertilizer",
    price: Number(12),
    unit: "bag",
    category: "Farm",
    image:
      "https://risso-chemical.com/wp-content/uploads/2024/12/Bio-organic-fertilizer-1024x1024.png",
  },
  {
    id: 2,
    name: "Hybrid Corn Seeds",
    price: Number(25),
    unit: "bag",
    category: "Farm",
    image:
      "https://img1.exportersindia.com/product_images/bc-full/2023/9/10559323/hybrid-corn-seed-1694517570-7076944.png",
  },
  {
    id: 3,
    name: "Animal Feed",
    price: Number(18),
    unit: "bag",
    category: "Farm",
    image:
      "https://www.partnersinfoodsolutions.com/sites/default/files/styles/blog_post/public/blog-images/IMG_6231.jpg?itok=S1B-mZGw",
  },
  {
    id: 4,
    name: "PVC Pipes",
    price: Number(5),
    unit: "each",
    category: "Equipment",
    image: "https://www.sam-uk.com/wp-content/uploads/2024/05/05.jpg",
  },
  {
    id: 5,
    name: "Drip Irrigation Kit",
    price: Number(140),
    unit: "kit",
    category: "Equipment",
    image:
      "https://ae01.alicdn.com/kf/HTB1GX4eSFXXXXc0XFXXq6xXFXXXq/25m-Micro-Drip-Irrigation-System-Plant-Automatic-Spray-Greenhouse-Watering-Kits-Garden-Hose-AdjustableDripper-Sprinkler-XJ.jpg",
  },
  {
    id: 6,
    name: "Nylon Netting",
    price: Number(35),
    unit: "roll",
    category: "Equipment",
    image:
      "https://customnets.com/wp-content/uploads/2023/07/nylon-netting-smaill-1024x683.jpg",
  },
  {
    id: 7,
    name: "Herbicide",
    price: Number(22),
    unit: "bottle",
    category: "Chemical",
    image:
      "https://2ecffd01e1ab3e9383f0-07db7b9624bbdf022e3b5395236d5cf8.ssl.cf4.rackcdn.com/Product-800x800/68eb7e95-7d77-4413-96b9-5fb7e325b379.jpg",
  },
  {
    id: 8,
    name: "Pesticide",
    price: Number(20),
    unit: "bottle",
    category: "Chemical",
    image:
      "https://static.vecteezy.com/system/resources/previews/010/508/297/large_2x/old-farmers-spray-fertilizer-or-chemical-pesticides-in-the-rice-fields-chemical-fertilizers-free-photo.jpg",
  },
  {
    id: 9,
    name: "Greenhouse Film",
    price: Number(100),
    unit: "roll",
    category: "Equipment",
    image:
      "https://empak.co.nz/wp-content/uploads/2023/05/RNR-Nursery_Land-Stills_05-2048x1365.jpg",
  },
  {
    id: 10,
    name: "Foliar Fertilizer",
    price: Number(15),
    unit: "bottle",
    category: "Chemical",
    image:
      "https://www.agrivi.com/wp-content/uploads/2016/08/Blog-Foliar-fertilization.png",
  },
];

const categories = ["All", "Farm", "Equipment", "Chemical"];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  // Filter by search and category
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const { addToCart } = useCart();

  const handleAdd = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Products</h1>

      {/* Multi-item Carousel */}
      <Carousel
        responsive={responsive}
        autoPlay
        infinite
        keyBoardControl
        containerClass="mb-6"
        itemClass="px-2"
      >
        {currentProducts.map((product) => (
          <div key={product.id}>
            <img
              src={product.image}
              alt={product.name}
              className="rounded-lg h-48 w-full object-cover"
            />
          </div>
        ))}
      </Carousel>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search products"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full text-center mx-auto border p-2 rounded mb-4 items-center justify-center"
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded ${
              selectedCategory === cat
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-xl shadow-lg hover:shadow-lg transition p-2 flex flex-col"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded"
            />
            <div className="flex justify-between p-2">
              <div className="">
                <h2 className="font-medium mt-2">{product.name}</h2>
                <p className="text-gray-600 mb-2">
                  ${product.price.toFixed(2)} / {product.unit}
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => handleAdd(product)}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
