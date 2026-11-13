import EventDetail from '@/components/comon/event/EventDetail';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetail key={id} id={id} />;
}
