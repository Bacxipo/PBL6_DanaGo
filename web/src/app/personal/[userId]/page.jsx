import { notFound } from 'next/navigation';
import PublicProfile from '@/components/comon/community/PublicProfile';

export default async function UserProfilePage({ params }) {
  const { userId } = await params;
  const id = Number(userId);
  if (!/^\d+$/.test(userId) || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647) notFound();
  return <PublicProfile key={id} userId={id} />;
}
