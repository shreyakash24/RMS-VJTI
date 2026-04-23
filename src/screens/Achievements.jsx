import React, { useState, useEffect } from 'react';
import { Award, Plus, FileText, Check, X, Clock, Filter, Calendar } from 'lucide-react';

export default function Achievements({ userRole, userName, userEmail, userId }) {
  const [achievements, setAchievements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', description: '' });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedSubDept, setSelectedSubDept] = useState("All"); 
  const [selectedYears, setSelectedYears] = useState([]); 

  const role = userRole ? userRole.toLowerCase() : "";
  const isHOD = role.includes('hod');
  const isAccounts = role.includes('account');

  const academicLabels = ["FY", "SY", "TY", "LY"];

  const getDeptGroup = (email) => {
    if (!email) return "unknown";
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return "unknown";
    const dept = domain.split('.')[0];
    if (dept === 'cs' || dept === 'it') return 'cs-it';
    return dept;
  };

  const getBatchFromEmail = (email) => {
    if (!email) return "unknown";
    const match = email.match(/b(\d{2})/i);
    return match ? `b${match[1]}` : "unknown";
  };

  const myDeptGroup = getDeptGroup(userEmail);

  /**
   * FIXED LOGIC:
   * If batch is b24:
   * FY = 24 + 1 = 25
   * SY = 24 + 2 = 26
   * TY = 24 + 3 = 27
   * LY = 24 + 4 = 28
   */
  const getYearRange = (batch) => {
    if (batch === "All" || batch === "unknown") return [];
    const batchNum = parseInt(batch.replace('b', ''));
    const startYear = batchNum + 1; // FY starts at batch + 1
    return [startYear, startYear + 1, startYear + 2, startYear + 3].map(yr => String(yr).padStart(2, '0'));
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      console.error("Failed to load achievements", err);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    setSelectedYears([]);
  }, [selectedBatch]);

  const handleApproval = async (achId, newStatus) => {
    const remark = prompt(`Enter ${newStatus} remarks (required):`);
    if (!remark) return;

    try {
      const response = await fetch('/api/achievement-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievement_id: achId,
          approver_id: userId,
          status: newStatus,
          remarks: remark,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (response.ok) fetchAchievements();
    } catch {
      alert("Error processing approval");
    }
  };

  const toggleYear = (year) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  // --- FILTERING LOGIC ---
  let displayAchievements = achievements;

  if (!isAccounts) {
    if (isHOD) {
      displayAchievements = achievements.filter(
        ach => getDeptGroup(ach.user_email) === myDeptGroup
      );

      if (myDeptGroup === 'cs-it' && selectedSubDept !== "All") {
        displayAchievements = displayAchievements.filter(ach => {
          const dept = ach.user_email.split('@')[1]?.split('.')[0].toLowerCase();
          return dept === selectedSubDept.toLowerCase();
        });
      }

      if (selectedBatch !== "All") {
        displayAchievements = displayAchievements.filter(
          ach => getBatchFromEmail(ach.user_email) === selectedBatch
        );
      }

      if (selectedYears.length > 0) {
        displayAchievements = displayAchievements.filter(ach => {
          if (!ach.date) return false;
          // Extract last 2 digits of year from "2025-01-01" -> "25"
          const achYear = ach.date.split('-')[0].slice(-2); 
          return selectedYears.includes(achYear);
        });
      }
    } else {
      displayAchievements = achievements.filter(
        ach => ach.user_email === userEmail
      );
    }
  }

  const pendingQueue = displayAchievements.filter(a => a.status === 'Pending');
  const verifiedLedger = displayAchievements.filter(a => a.status === 'Approved');
  const batchOptions = ["All", ...new Set(achievements.map(a => getBatchFromEmail(a.user_email)).filter(b => b !== "unknown"))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append('user_id', userId);
    data.append('title', formData.title);
    data.append('date', formData.date);
    data.append('description', formData.description);
    data.append('status', 'Pending');
    if (file) data.append('file', file);

    try {
      const response = await fetch('/api/achievements', { method: 'POST', body: data });
      if (response.ok) {
        setFormData({ title: '', date: '', description: '' });
        setFile(null);
        setShowForm(false);
        fetchAchievements();
      }
    } catch {
      alert("Error saving achievement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#001529] tracking-tight">
            {isHOD ? 'Departmental Achievements' : 'My Achievements'}
          </h2>

          {isHOD && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-2 bg-[#002045] text-white px-3 py-1.5 rounded-lg shadow-md">
                <Filter size={12} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{myDeptGroup}</span>
              </div>

              {myDeptGroup === 'cs-it' && (
                <div className="flex bg-white border-2 border-slate-200 rounded-lg p-1 shadow-sm">
                  {['All', 'CS', 'IT'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedSubDept(opt)}
                      className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${selectedSubDept === opt ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="appearance-none bg-white border-2 border-slate-200 text-[#002045] text-[11px] font-bold px-4 py-1.5 pr-8 rounded-lg shadow-sm focus:border-blue-500 outline-none transition-all"
                >
                  {batchOptions.map((b, i) => (
                    <option key={i} value={b}>{b === "All" ? "Select Batch" : b.toUpperCase()}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <Plus size={12} className="rotate-45" />
                </div>
              </div>

              {selectedBatch !== "All" && (
                <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase border-r pr-2">Year</span>
                  <div className="flex gap-3">
                    {getYearRange(selectedBatch).map((yr, idx) => (
                      <label key={yr} className="flex items-center gap-1.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedYears.includes(yr)}
                          onChange={() => toggleYear(yr)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-[11px] font-bold ${selectedYears.includes(yr) ? 'text-blue-600' : 'text-slate-500'}`}>
                          {academicLabels[idx]} ('{yr})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isHOD && !isAccounts && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-[#002045] text-white rounded-xl hover:bg-[#003366] transition-all shadow-lg hover:shadow-blue-900/20 font-bold text-sm">
            <Plus size={18} /> Add Achievement
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
             <Award className="text-blue-600" /> Register New Milestone
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Achievement Title</label>
                  <input type="text" required placeholder="Ex: Hackathon Winner" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date Achieved</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 transition-all" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</label>
                <textarea placeholder="Describe your accomplishment..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 transition-all" rows="3"></textarea>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Certificate Proof</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full border-2 border-dashed border-slate-200 p-4 rounded-xl text-sm bg-slate-50/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700" />
             </div>
             <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-green-700 transition-all">
                  {isLoading ? 'Uploading...' : 'Submit for Verification'}
                </button>
             </div>
          </form>
        </div>
      )}
      
      {isHOD && pendingQueue.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
            <Clock size={14} className="animate-pulse" /> Pending Verification ({pendingQueue.length})
          </h3>
          <div className="grid gap-3">
            {pendingQueue.map(ach => (
              <div key={ach.id} className="bg-white p-5 rounded-2xl border-l-[6px] border-orange-500 shadow-md flex justify-between items-center group hover:shadow-lg transition-all">
                <div>
                  <h4 className="font-black text-slate-800 text-lg">{ach.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[11px] text-slate-500 font-bold uppercase">{ach.user_name}</p>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <p className="text-[11px] text-blue-600 font-black uppercase tracking-tight">{ach.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ach.document_url && (
                    <a href={ach.document_url} target="_blank" rel="noreferrer" className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <FileText size={22}/>
                    </a>
                  )}
                  <button onClick={() => handleApproval(ach.id, 'Approved')} className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-colors">
                    <Check size={24} strokeWidth={3}/>
                  </button>
                  <button onClick={() => handleApproval(ach.id, 'Rejected')} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <X size={24} strokeWidth={3}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {(isHOD || isAccounts) ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Achievement</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verifiedLedger.length > 0 ? verifiedLedger.map((ach) => (
                  <tr key={ach.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800">{ach.user_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ach.user_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{ach.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{ach.date}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-black text-[9px] uppercase ${ach.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ach.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ach.document_url && (
                        <a href={ach.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 font-black text-[11px] hover:underline underline-offset-4">
                          VIEW <FileText size={12} />
                        </a>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold italic">No approved records found matching filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayAchievements.map((ach) => (
              <div key={ach.id} className="bg-white p-7 rounded-2xl shadow-md border-b-4 border-slate-200 relative group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <span className={`absolute top-4 right-4 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight shadow-sm ${
                  ach.status === 'Approved' ? 'bg-green-600 text-white' : 
                  ach.status === 'Rejected' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {ach.status}
                </span>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-50 transition-colors">
                  <Award className="text-[#002045] group-hover:text-blue-600 transition-colors" size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight">{ach.title}</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3 font-medium">{ach.description}</p>
                <div className="pt-5 border-t border-slate-50 flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{ach.date}</span>
                  </div>
                  {ach.document_url && (
                    <a href={ach.document_url} target="_blank" rel="noreferrer" className="text-[#002045] text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-[#002045] hover:text-white transition-all">
                      Proof
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}