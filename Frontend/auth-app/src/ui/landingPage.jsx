import React from 'react';
import { motion } from 'framer-motion';
import { Nav } from './Nav';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentProducts } from '../Procurement/features/productSlice';
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../services/AdminRoutes/ProductsManagement';
import { useEffect } from 'react';
import { setProducts } from '../Procurement/features/productSlice';

export function LandingPage() {
  const dispatch = useDispatch();
  const currentProducts = useSelector(selectCurrentProducts);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
    staleTime: 5 * 60 * 1000, // 5 mins
    enabled: currentProducts.length === 0, // Only fetch if not already loaded
  });

  useEffect(() => {
    if (data) {
      dispatch(setProducts(data));
    }
  }, [data, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation */}
      <Nav />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-blue-600 text-white py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-5xl font-bold mb-4"
          >
            Welcome to Lasu Cooperative Society
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl mb-8"
          >
            Empowering communities through collaboration and shared success.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-full hover:bg-blue-100 transition duration-300"
          >
            Join Us Today
          </motion.button>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-4xl font-bold text-center mb-12 text-blue-600"
          >
            Why Choose Us?
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ staggerChildren: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Trustworthy",
                description:
                  "We prioritize transparency and integrity in all our operations.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Community Focused",
                description:
                  "Our mission is to uplift and empower local communities.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                ),
                title: "Sustainable Growth",
                description:
                  "We focus on long-term growth and prosperity for all members.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white p-8 rounded-lg shadow-lg text-center"
              >
                {feature.icon}
                <h3 className="text-2xl font-bold mb-4 text-blue-600">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-4xl font-bold text-center mb-12 text-blue-600"
          >
            What Our Members Say
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ staggerChildren: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                quote: "Being part of this cooperative has changed my life. I've learned so much!",
                author: "- Jane Doe",
              },
              {
                quote: "The support and resources provided are unmatched. Highly recommend!",
                author: "- John Smith",
              },
              {
                quote: "This cooperative truly cares about its members and their success.",
                author: "- Emily Johnson",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <p className="text-gray-700 mb-4">{testimonial.quote}</p>
                <p className="font-bold text-blue-600">{testimonial.author}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-4xl font-bold text-center mb-12 text-blue-600"
          >
            Featured Products
          </motion.h2>

          {/* Skeleton Loading */}
          {isLoading ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ staggerChildren: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-white p-6 rounded-xl shadow-lg text-center"
                >
                  {/* Image Skeleton */}
                  <div className="h-40 overflow-hidden rounded-lg mb-4 bg-gray-200 animate-pulse"></div>

                  {/* Title Skeleton */}
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse mx-auto w-3/4"></div>

                  {/* Price Skeleton */}
                  <div className="h-5 bg-gray-200 rounded mb-1 animate-pulse mx-auto w-1/2"></div>

                  {/* Category Skeleton */}
                  <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-1/4"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Loaded Products */
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ staggerChildren: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {currentProducts.slice(0, 3).map((product) => (
                <Link to="/productPage" key={product._id} className="block">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                  >
                    <div className="h-40 overflow-hidden rounded-lg mb-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-blue-600 font-semibold">
                      ${product.price.toFixed(2)} / {product.unit}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Link to="/productPage">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-blue-700 transition duration-300"
              >
                View All Products
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="bg-blue-600 text-white py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Join Us?
          </motion.h2>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-xl mb-8"
          >
            Become a part of our growing community today!
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-full hover:bg-blue-100 transition duration-300"
          >
            Get Started
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Gbewa Cooperative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}