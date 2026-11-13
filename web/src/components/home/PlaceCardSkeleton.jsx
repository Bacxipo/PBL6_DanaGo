export default function PlaceCardSkeleton({ label = 'Đang tải địa điểm…' }) {
    return (
        <div role="status" aria-label={label}>
            <span className="sr-only">{label}</span>
            <div
                aria-hidden="true"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
                {Array.from({ length: 4 }, (_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white motion-safe:animate-pulse"
                    >
                        <div className="h-48 bg-slate-200/70" />
                        <div className="space-y-4 p-5">
                            <div className="h-4 w-4/5 rounded bg-slate-200" />
                            <div className="h-3 rounded bg-slate-100" />
                            <div className="h-3 w-2/3 rounded bg-slate-100" />
                            <div className="h-8 rounded bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
