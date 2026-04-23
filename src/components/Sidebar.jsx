import React from 'react';
import { LayoutDashboard, CheckSquare, LogOut, School, Award, PlusCircle, X } from 'lucide-react';

export default function Sidebar({ currentScreen, navigate, userRole, userName, isOpen, setIsOpen }) {
  const role = userRole ? userRole.toLowerCase() : "";

  const handleNavigate = (id) => {
    navigate(id);
    setIsOpen(false); 
  };

  return (
    <>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white/50 z-20" 
          onClick={() => setIsOpen(false)} 
        />
      )}


      <aside className={`h-screen w-64 fixed left-0 top-0 bg-white border-r border-gray-200 flex flex-col py-6 z-[60] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-8 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <School size={28} className="text-[#002045]" />
            <h1 className="text-xl font-black text-[#002045]">RMS-VJTI</h1>
          </div>
          

          <button 
            className="p-1 text-gray-500 hover:text-red-600 transition-colors" 
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => handleNavigate('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-bold text-sm ${currentScreen === 'dashboard' ? 'bg-[#002045] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutDashboard size={18} /><span>Dashboard</span>
          </button>
          {(role.includes('hod') || role.includes('professor') || role.includes('student')) && (
          <button onClick={() => handleNavigate('achievements')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-bold text-sm ${currentScreen === 'achievements' ? 'bg-[#002045] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Award size={18} /><span>Achievements</span>
          </button>)}

          {(role.includes('hod') || role.includes('account')) && (
            <button onClick={() => handleNavigate('approvals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-bold text-sm ${currentScreen === 'approvals' ? 'bg-[#002045] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <CheckSquare size={18} /><span>Verifications</span>
            </button>
          )}
        </nav>

        <div className="px-4 mt-auto space-y-2 pt-4 border-t">
          {(role.includes('student') || role.includes('professor')) && (
            <button onClick={() => handleNavigate('new-application')} className="w-full flex items-center gap-3 px-4 py-3 bg-[#002045] text-white rounded-md font-bold text-sm hover:bg-[#1a365d]">
              <PlusCircle size={18} /><span>New Application</span>
            </button>
          )}
          <button onClick={() => handleNavigate('login')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md font-bold text-sm transition-colors">
            <LogOut size={18} /><span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}