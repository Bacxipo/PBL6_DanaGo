import { notFound } from 'next/navigation';
import AnalyticsPage from '@/views/AnalyticsPage';
import CategoriesPage from '@/views/CategoriesPage';
import DashboardPage from '@/views/DashboardPage';
import DestinationsPage from '@/views/DestinationsPage';
import EventsPage from '@/views/EventsPage';
import ModerationPage from '@/views/ModerationPage';
import UsersPage from '@/views/UsersPage';

// Mỗi mục menu là một đường dẫn /{section}: một route động thay cho nhiều file page.tsx
const SCREENS: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  destinations: DestinationsPage,
  categories: CategoriesPage,
  moderation: ModerationPage,
  users: UsersPage,
  analytics: AnalyticsPage,
  events: EventsPage
};

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const Screen = SCREENS[(await params).section];
  if (!Screen) notFound();
  return <Screen />;
}
