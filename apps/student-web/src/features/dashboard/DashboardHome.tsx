import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import styles from './DashboardHome.module.css';

interface QuickLink {
  to: string;
  type: string;
  title: string;
  description: string;
}

const quickLinks: QuickLink[] = [
  {
    to: '/placement',
    type: 'Get started',
    title: 'Take the placement test',
    description: 'Find your starting level so your lessons match your skills.',
  },
  {
    to: '/curriculum',
    type: 'Learn',
    title: 'Browse courses',
    description: 'Explore subjects and pick up where you left off.',
  },
  {
    to: '/progress',
    type: 'Track',
    title: 'View your progress',
    description: 'See how your skills are developing over time.',
  },
  {
    to: '/assessments',
    type: 'Practice',
    title: 'Assessments',
    description: 'Check your understanding with graded assessments.',
  },
  {
    to: '/ai-teacher',
    type: 'Help',
    title: 'Ask the AI Teacher',
    description: 'Get explanations and hints whenever you are stuck.',
  },
  {
    to: '/reports',
    type: 'Review',
    title: 'My reports',
    description: 'Review the reports available to you.',
  },
];

export function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        {user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
      </h1>

      <section>
        <h2 className={styles.sectionTitle}>Quick links</h2>
        <div className={styles.statsGrid}>
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className={styles.recLink}>
              <Card>
                <span className={styles.recType}>{link.type}</span>
                <p className={styles.recTitle}>{link.title}</p>
                <p className={styles.dueDate}>{link.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
