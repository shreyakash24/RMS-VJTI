import React, { useState } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';

export default function TopBar({ currentScreen, userName, userEmail, userRole, notifications = [], clearNotification, clearAllNotifications, isSidebarOpen, setIsSidebarOpen }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const titles = {
    dashboard: 'Dashboard',
    'new-application': 'New Reimbursement Application',
    approvals: 'Pending Applications',
    achievements: 'Achievements'
  };

  const myNotifications = notifications.filter(n => 
    n.targetEmail === userEmail || n.targetRole === userRole
  );

  return (
    <header className={`fixed top-0 right-0 bg-white border-b border-gray-200 flex justify-between items-center px-4 md:px-8 h-16 z-30 transition-all duration-300 ${isSidebarOpen ? 'md:left-64 left-0' : 'left-0'}`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-[#002045] truncate max-w-[150px] sm:max-w-none">{titles[currentScreen] || 'Dashboard'}</h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-md text-sm focus:ring-2 focus:ring-[#002045] outline-none w-64" 
            placeholder="Search..." 
            type="text" 
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)} 
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {myNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#002045]">Notifications</h3>
                    <span className="text-xs bg-[#002045] text-white px-2 py-0.5 rounded-full">{myNotifications.length}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {myNotifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                      >
                        Clear All
                      </button>
                    )}
                    <button 
                      onClick={() => setIsNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="Close panel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                {myNotifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No new notifications.</div>
                ) : (
                  myNotifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors relative group">
                      <div className="pr-6">
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                      </div>
                      <button 
                        onClick={() => clearNotification(notif.id)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                        title="Clear notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            </>
          )}
        </div>
        
        <div className="relative group cursor-pointer ml-2">
          <div className="w-9 h-9 rounded-full bg-[#002045] text-white flex items-center justify-center font-bold shadow-sm">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4">
            <p className="text-sm font-bold text-gray-900 truncate">{userName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate mt-1">{userEmail || 'user@vjti.ac.in'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
