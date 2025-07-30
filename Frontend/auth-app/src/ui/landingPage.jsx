import React from 'react';
import { motion } from 'framer-motion';
import { Nav } from './Nav';

export  function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50">       
        <Nav/>
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
                        Welcome to Gbewa Cooperative Society
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
                        animate={{ opacity: 1 }}
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
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
                                <h3 className="text-2xl font-bold mb-4 text-blue-600">
                                    {feature.title}
                                </h3>
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
                                quote:
                                    "Being part of this cooperative has changed my life. I've learned so much!",
                                author: "- Jane Doe",
                            },
                            {
                                quote:
                                    "The support and resources provided are unmatched. Highly recommend!",
                                author: "- John Smith",
                            },
                            {
                                quote:
                                    "This cooperative truly cares about its members and their success.",
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
                    <p>&copy; 2023 Cooperative Society. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

