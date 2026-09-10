import Rating from "./Rating";
export default function PlaceReview({ avataUrl, name, stars, comment }) {
    return(
        <div className='flex flex-col shadow-xl/20 p-3 rounded-lg gap-y-2 w-1/2'>
            <div className = 'flex items-center gap-x-2'>
                <img src={avataUrl} alt={name} className="w-10 h-10 rounded-full" />
                <div>
                    <span>{name}</span>
                    <Rating rating={stars} />
                </div>
            </div>
            <p className="text-gray-600 w-full break-words">{comment}</p>
        </div>
    );
}