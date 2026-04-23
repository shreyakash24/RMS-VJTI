import React from 'react';
import { FileText, IndianRupee } from 'lucide-react';

export default function Dashboard({ userRole, userEmail, applications }) {
  const role = userRole ? userRole.toLowerCase() : "";
  const isHOD = role.includes('hod');
  const isAccounts = role.includes('account');

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


  let displayApps = [];

  if (isAccounts) {
    displayApps = applications; 
  } else if (isHOD) {
    displayApps = applications.filter(app => getDeptGroup(app.applicantEmail) === myDeptGroup);
  } else {

    displayApps = applications.filter(app => app.applicantEmail === userEmail);
  }

  
  const pending = displayApps.filter(app => app.status.includes('Pending')).length;
  const paid = displayApps.filter(app => app.status === 'Paid').length;
  const total = displayApps.filter(app => app.status === 'Paid').reduce((sum, app) => sum + Number(app.amount), 0);

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Pending Review</h3>
          <p className="text-3xl font-bold text-[#002045]">{pending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Approved & Paid</h3>
          <p className="text-3xl font-bold text-green-600">{paid}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Total Reimbursed</h3>
          <p className="text-3xl font-bold text-[#002045]">₹{total.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-[#002045]">
            {isHOD ? `Dept: ${myDeptGroup === 'cs-it' ? 'CS & IT' : myDeptGroup.toUpperCase()}` : "My Claims History"}
          </h3>
          {isHOD && <span className="text-[10px] text-gray-400 font-mono">Filter: {myDeptGroup}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-xs font-bold text-gray-500">REF ID</th>
                {(isHOD || isAccounts) && <th className="px-6 py-3 text-xs font-bold text-gray-500">APPLICANT</th>}
                <th className="px-6 py-3 text-xs font-bold text-gray-500">DATE</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500">CATEGORY</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500">AMOUNT</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500">STATUS</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500">PROOF</th>
              </tr>
            </thead>
            <tbody>
              {displayApps.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-400 italic">
                    No applications found for this group.
                  </td>
                </tr>
              ) : (
                displayApps.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-[#002045]">{app.id}</td>
                    {(isHOD || isAccounts) && (
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold">{app.applicantName}</div>
                        <div className="text-[10px] text-gray-400">{app.applicantEmail}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm">{app.date}</td>
                    <td className="px-6 py-4 text-sm">{app.category}</td>
                    <td className="px-6 py-4 text-sm font-bold">₹{Number(app.amount).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${app.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.documentName ? (
                        <a 
                          href={app.documentName} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit"
                        >
                          <FileText size={14} /> View
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs italic">No file</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}