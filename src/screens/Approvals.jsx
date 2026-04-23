import React, { useState } from 'react';
import { Check, X, FileText, IndianRupee } from 'lucide-react';

export default function Approvals({ applications, onUpdate, userRole, userEmail }) {
  const [remarks, setRemarks] = useState({});

  const getDeptGroup = (email) => {
    if (!email) return "unknown";
  
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return "unknown";

    const dept = domain.split('.')[0];
  
    if (dept === 'cs' || dept === 'it') {
      return 'cs-it';
    }
  
    return dept;
  };

  const myDeptGroup = getDeptGroup(userEmail);

  const filterApps = () => {
    const role = userRole ? userRole.toLowerCase() : "";

    if (role.includes('hod')) {
      return applications.filter(app => 
        app.status === 'Pending HOD' && 
        getDeptGroup(app.applicantEmail) === myDeptGroup
      );
    }
    
    if (role.includes('account')) {
      return applications.filter(app => app.status === 'Pending Accounts');
    }

    return [];
  };

  const pendingItems = filterApps();

  const handleRemarkChange = (id, value) => {
    setRemarks({ ...remarks, [id]: value });
  };

  const handleAction = (id, newStatus) => {
    const remark = remarks[id] || '';
    if (!remark.trim()) {
      alert("Please provide a remark. Institutional records require a reason for all approval actions.");
      return;
    }
    onUpdate(id, newStatus, remark, userRole);
    setRemarks({ ...remarks, [id]: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#002045]">Verification Queue</h2>
        </div>
      </div>
      
      <div className="grid gap-4">
        {pendingItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-gray-400">
            <Check className="mx-auto mb-2 opacity-20" size={48} />
            <p>No applications require your attention for this department right now.</p>
          </div>
        ) : pendingItems.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4 hover:border-blue-200 transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-[#002045] text-white px-2 py-0.5 rounded uppercase tracking-wider">{item.role}</span>
                  <span className="text-sm text-gray-500 font-mono">{item.id}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.applicantName}</h3>
                <p className="text-gray-600 font-medium">{item.category}</p>
                
                {item.documentName && (
                  <div className="mt-3 flex items-center gap-2">
                    <a 
                      href={item.documentName} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100"
                    >
                      <FileText size={14} /> VIEW ATTACHED RECEIPT
                    </a>
                  </div>
                )}
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-black text-[#002045] flex items-center md:justify-end">
                  <IndianRupee size={20} />
                  {Number(item.amount).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400 mt-1">Submitted on {item.date}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Verification Remarks</label>
                <input 
                  type="text" 
                  placeholder="Enter remarks for the student/accounts..." 
                  className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-[#002045]"
                  value={remarks[item.id] || ''}
                  onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleAction(item.id, userRole.toLowerCase().includes('hod') ? 'Pending Accounts' : 'Paid')} 
                  className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white rounded font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Check size={16} />
                  {userRole.toLowerCase().includes('hod') ? 'Verify & Forward' : 'Approve & Pay'}
                </button>
                <button 
                  onClick={() => handleAction(item.id, `Rejected by ${userRole.split(' ')[0]}`)} 
                  className="flex-1 md:flex-none px-6 py-2 bg-white text-red-600 border border-red-200 rounded font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}