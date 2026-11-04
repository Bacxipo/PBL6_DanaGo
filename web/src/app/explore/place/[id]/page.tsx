import DetailPlace from '@/pages/DetailPlace';

export default async function DetailPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailPlace id={id} />;
}
