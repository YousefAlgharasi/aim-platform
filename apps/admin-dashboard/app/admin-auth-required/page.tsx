import { redirect } from 'next/navigation';

export default function AdminAuthRequiredPage() {
  redirect('/login');
}
