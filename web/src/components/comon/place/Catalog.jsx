export default function Catalog({ name, img }) {
    const imgSrc = typeof img === 'string' ? img : img?.src || img;

    return (
        <div 
            className="w-full h-48 sm:h-56 md:h-64 bg-cover bg-center rounded-2xl relative overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            style={{ backgroundImage: `url(${imgSrc})` }}
        >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all flex items-center justify-center p-4">
                <h3 className="text-white text-xl sm:text-2xl font-bold drop-shadow-md text-center">
                    {name}
                </h3>
            </div>
        </div>
    );
}
