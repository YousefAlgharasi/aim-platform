import { NavLink } from 'react-router-dom';
import styles from './MobileNav.module.css';

const mobileNavItems = [
  { to: '/', label: 'Home' },
  { to: '/progress', label: 'Progress' },
  { to: '/curriculum', label: 'Learn' },
  { to: '/ai-teacher', label: 'AI' },
  { to: '/settings', label: 'More' },
];

export function MobileNav() {
  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {mobileNavItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
