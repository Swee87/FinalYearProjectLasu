import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socket } from '../services/socket';
import {
  Notification as fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
} from '../services/Notification';

export const Notification = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const queryClient = useQueryClient();
  const audioRef = useRef(null);
  const dropdownRef = useRef(null);

  // Unlock audio on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioUnlocked && audioRef.current) {
        // Create a silent audio context to unlock the audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
        
        // Also play our notification sound silently to unlock it
        const originalVolume = audioRef.current.volume;
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.volume = originalVolume;
          setAudioUnlocked(true);
        }).catch(e => {
          console.warn("Audio unlock failed:", e);
        });
      }
    };

    const handleInteraction = () => {
      unlockAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [audioUnlocked]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedNotification(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const {
    data: notifications = [],
    refetch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  // Socket.io: listen for new notification
  useEffect(() => {
    const handleNewNotification = (data) => {
      if (audioRef.current && audioUnlocked) {
        try {
          audioRef.current.play().catch(e => {
            console.warn("Failed to play notification sound:", e);
          });
        } catch (e) {
          console.error("Error playing notification sound:", e);
        }
      }
      queryClient.invalidateQueries(['notifications']);
    };

    socket.on('New-loan-submitted', handleNewNotification);

    return () => {
      socket.off('New-loan-submitted', handleNewNotification);
    };
  }, [queryClient, audioUnlocked]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsReadMutation.mutate(notif._id);
    }
    setSelectedNotification(notif);
  };

  const handleBackToList = () => {
    setSelectedNotification(null);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notif => {
      if (!notif.read) {
        markAsReadMutation.mutate(notif._id);
      }
    });
  };

  return (
    <div className="relative">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      
      {/* Notification Bell */}
      <button
        onClick={() => {
          setShowDropdown(prev => !prev);
          setSelectedNotification(null);
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[18px] min-h-[18px] flex items-center justify-center px-1 py-0.5 rounded-full transform scale-100 transition-transform duration-300">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Notification Dropdown */}
      <div 
        ref={dropdownRef}
        className={`absolute right-0 mt-2 w-[360px] max-h-[500px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-300 transform origin-top-right ${
          showDropdown 
            ? 'scale-100 opacity-100 visible' 
            : 'scale-95 opacity-0 invisible'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {notifications.length} total
            </span>
          </div>
        </div>

        {isError ? (
          <div className="py-6 flex flex-col items-center justify-center text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-700 font-medium">Failed to load notifications</p>
            <p className="text-gray-500 text-sm mt-1">Please try again later</p>
            <button 
              onClick={() => refetch()}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 rounded"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center p-4">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">No notifications yet</p>
            <p className="text-gray-500 text-sm mt-1">We'll notify you when something arrives</p>
          </div>
        ) : selectedNotification ? (
          // Notification Detail View
          <div className="p-4">
            <button
              onClick={handleBackToList}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to notifications
            </button>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notification Details</h3>
                <div className="flex space-x-2">
                  {!selectedNotification.read && (
                    <button
                      onClick={() => {
                        markAsReadMutation.mutate(selectedNotification._id);
                        setSelectedNotification({...selectedNotification, read: true});
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => {
                      deleteMutation.mutate(selectedNotification._id);
                      setSelectedNotification(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-1">
                <p className="text-gray-700 mb-3">{selectedNotification.message}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{selectedNotification.UserName || 'System'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(selectedNotification.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(selectedNotification.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{selectedNotification.read ? 'Read' : 'Unread'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Full Message</h4>
              <p className="text-gray-600">{selectedNotification.message}</p>
            </div>
          </div>
        ) : (
          // Notification List View
          <ul className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <li
                key={notif._id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  notif.read ? '' : 'bg-blue-50'
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.read ? 'bg-gray-200' : 'bg-blue-100'
                    }`}>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${
                        notif.read ? 'text-gray-700' : 'text-gray-900 font-semibold'
                      }`}>
                        {notif.message}
                      </p>
                      {!notif.read && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <div className="mt-1 flex justify-between items-center">
                      <div className="text-xs text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {notif.UserName || 'System'}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {/* Footer */}
        {!selectedNotification && notifications.length > 0 && (
          <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-200 flex justify-between">
            <button 
              onClick={() => setShowDropdown(false)}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100"
            >
              Close
            </button>
            <div className="flex space-x-2">
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
              <button 
                onClick={() => refetch()}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
