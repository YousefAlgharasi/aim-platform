import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/placement', label: 'Placement Test' },
  { to: '/progress', label: 'Progress' },
  { to: '/curriculum', label: 'Courses' },
  { to: '/assessments', label: 'Assessments' },
  { to: '/ai-teacher', label: 'AI Teacher' },
  { to: '/voice-teacher', label: 'Voice Teacher' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/reports', label: 'Reports' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/billing', label: 'Billing' },
  { to: '/support', label: 'Support' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.logo}>AIM</div>
      <nav className={styles.nav}>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
