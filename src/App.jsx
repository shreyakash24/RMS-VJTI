import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import NewApplication from './screens/NewApplication';
import Approvals from './screens/Approvals';
import Achievements from './screens/Achievements';


const ROLE_PERMISSIONS = {
  'student': ['dashboard', 'new-application', 'achievements'],
  'professor': ['dashboard', 'new-application', 'achievements'],
  'hod': ['dashboard', 'approvals', 'achievements'],
  'account': ['dashboard', 'approvals']
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null); 
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
  
      const appsRes = await fetch('/api/reimbursements');
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data);
      }
  
  
      try {
        const notifsRes = await fetch('/api/reimbursement-approvals');
        if (notifsRes.ok) {
          setNotifications(await notifsRes.json());
        }
      } catch (e) {
        console.warn("Approvals route check failed.");
      }
  
    } catch (error) {
      console.error("Critical error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && currentScreen !== 'login') {
      fetchData();
    }
  }, [user, currentScreen, fetchData]);

 
  const navigate = (screen) => {
    if (screen === 'login') {
      setUser(null);
      setCurrentScreen('login');
      return;
    }
    

    const roleStr = user?.role?.toLowerCase() || "";
    

    let allowed = ['dashboard'];
    if (roleStr.includes('student')) allowed = ROLE_PERMISSIONS['student'];
    else if (roleStr.includes('professor')) allowed = ROLE_PERMISSIONS['professor'];
    else if (roleStr.includes('hod') || roleStr.includes('head')) allowed = ROLE_PERMISSIONS['hod'];
    else if (roleStr.includes('account')) allowed = ROLE_PERMISSIONS['account'];

    if (allowed.includes(screen)) {
      setCurrentScreen(screen);
    } else {
      console.warn(`Access Denied: Role "${user.role}" cannot access screen "${screen}"`);
      setCurrentScreen('dashboard');
    }
  };

  const handleAddApplication = async (formData) => {
    const refId = `VJTI-REQ-${Date.now().toString().slice(-5)}`;
    formData.append('id', refId);
    formData.append('user_id', user.id); 
    formData.append('status', 'Pending HOD');
  
    try {
      const response = await fetch('/api/reimbursements', {
        method: 'POST',
        body: formData, 
      });
  
      if (response.ok) {
        fetchData();
        navigate('dashboard');
      }
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const handleUpdateApplication = async (id, newStatus, remarkText) => {
    try {
      const response = await fetch(`/api/reimbursements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
  
      if (response.ok) {
        await fetch('/api/reimbursement-approvals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reimbursement_id: id,
            approver_id: user.id,
            status: newStatus,
            remarks: remarkText,
            date: new Date().toISOString().split('T')[0]
          })
        });
        fetchData(); 
      }
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (currentScreen === 'login' || !user) {
    return <Login onLogin={(dbUser) => { setUser(dbUser); setCurrentScreen('dashboard'); }} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex overflow-hidden font-sans">
      <Sidebar 
        currentScreen={currentScreen} 
        navigate={navigate} 
        userRole={user.role} 
        userName={user.name} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <TopBar 
          currentScreen={currentScreen} 
          userName={user.name} 
          userEmail={user.email} 
          userRole={user.role}
          notifications={notifications}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="pt-24 px-4 md:px-8 pb-12 w-full flex-1 overflow-y-auto">
          {isLoading && <div className="text-center py-2 text-xs text-gray-400 animate-pulse">Syncing institutional records...</div>}

          {currentScreen === 'dashboard' && (
            <Dashboard userRole={user.role} userEmail={user.email} applications={applications} />
          )}

          {currentScreen === 'new-application' && (
            <NewApplication navigate={navigate} onSubmit={handleAddApplication} />
          )}

          {currentScreen === 'approvals' && (
            <Approvals 
              applications={applications} 
              onUpdate={handleUpdateApplication} 
              userRole={user.role}
              userEmail={user.email}
            />
          )}

          {currentScreen === 'achievements' && (
            <Achievements 
              userRole={user.role} 
              userName={user.name} 
              userEmail={user.email} 
              userId={user.id} 
            />
          )}
        </main>
      </div>
    </div>
  );
}