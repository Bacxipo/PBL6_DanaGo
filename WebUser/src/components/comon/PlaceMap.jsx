export default function PlaceMap({ mapUrl }) {
    if (!mapUrl) return null;

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">Vị trí</h2>
            <iframe 
                src={mapUrl}
                className="w-2/3 h-[400px] rounded-xl border-0" 
                allowFullScreen
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
            </iframe>
        </div>
    );
}