import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  BarChart3, 
  History, 
  BookOpen, 
  Lock, 
  Settings, 
  UserCircle 
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const links = [
    { to: '/scanner', label: 'URL Scanner', icon: ShieldCheck },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true },
    { to: '/analytics', label: 'Analytics Hub', icon: BarChart3, requiresAuth: true },
    { to: '/history', label: 'Scan History', icon: History, requiresAuth: true },
    { to: '/learning', label: 'Learning Center', icon: BookOpen },
    { to: '/admin', label: 'Admin Terminal', icon: Lock, requiresAdmin: true },
    { to: '/settings', label: 'Profile Settings', icon: Settings, requiresAuth: true }
  ];

  return (
    <div className="d-flex flex-column p-3 text-white" style={{ width: '260px', background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.05)', minHeight: 'calc(100vh - 65px)' }}>
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {links.map((link) => {
          // Check route access rules
          if (link.requiresAuth && !user) return null;
          if (link.requiresAdmin && !isAdmin()) return null;

          const IconComponent = link.icon;

          return (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 font-display transition-all ${
                    isActive 
                      ? 'active-link-cyber' 
                      : 'text-secondary-cyber'
                  }`
                }
              >
                <IconComponent size={18} />
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{link.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      
      {user && (
        <div className="mt-auto border-top border-secondary border-opacity-20 pt-3 px-2">
          <NavLink to="/settings" className="d-flex align-items-center gap-3 text-decoration-none text-light">
            <UserCircle size={24} className="text-info" />
            <div className="d-flex flex-column overflow-hidden">
              <span className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>{user.username}</span>
              <span className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>{user.email}</span>
            </div>
          </NavLink>
        </div>
      )}

      {/* Styled JSX for the Active/Inactive menu highlights with cyber accents */}
      <style>{`
        .active-link-cyber {
          background: rgba(0, 229, 255, 0.1) !important;
          color: #00E5FF !important;
          border-left: 3px solid #00E5FF;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          box-shadow: inset 4px 0 10px rgba(0, 229, 255, 0.05);
        }
        .text-secondary-cyber {
          color: #94A3B8;
        }
        .text-secondary-cyber:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #F8FAFC;
        }
        .transition-all {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
