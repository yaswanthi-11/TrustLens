import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: '#0F172A', color: '#F8FAFC' }}>
      <Navbar />
      <div className="d-flex flex-row flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4 overflow-y-auto" style={{ height: 'calc(100vh - 65px)', background: '#090D16' }}>
          <div className="container-fluid py-2 animate-slide-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
