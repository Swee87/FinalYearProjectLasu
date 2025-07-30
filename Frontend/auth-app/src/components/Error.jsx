import React from "react";

const statusConfig = {
  default: {
    title: "Something Went Wrong",
    message: "We're sorry, but an unexpected error occurred.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "red",
  },
  notFound: {
    title: "Page Not Found",
    message: "The page you are looking for doesn't exist.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "yellow",
  },
  network: {
    title: "No Internet Connection",
    message: "Please check your internet connection and try again.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: "blue",
  },
  unauthorized: {
    title: "Access Denied",
    message: "You don’t have permission to view this page.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "purple",
  },
};

export const ErrorPage = ({
  type = "default", // Can be 'default', 'notFound', 'network', 'unauthorized'
  title,
  message,
  showHomeButton = true,
  onRetry = null,
}) => {
  const selectedStatus = statusConfig[type] || statusConfig.default;

  const finalTitle = title || selectedStatus.title;
  const finalMessage = message || selectedStatus.message;
  const icon = selectedStatus.icon;
  const colorClass = `text-${selectedStatus.color}-500`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-6">{icon}</div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{finalTitle}</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">{finalMessage}</p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`px-5 py-2 bg-${selectedStatus.color}-500 hover:bg-${selectedStatus.color}-600 text-white rounded-md transition duration-200`}
            >
              Try Again
            </button>
          )}

          {showHomeButton && (
            <a
              href="/admin"
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition duration-200"
            >
              Go to Home
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

