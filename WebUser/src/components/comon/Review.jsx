import Rating from "./Rating";
export default function Review(avataUrl,name,stars,comment) {
    return(
        <div className=''>
            <div>
                <img src={avataUrl} alt={name} className="w-10 h-10 rounded-full" />
                <div>
                    <span>{name}</span>
                    <Rating rating={stars} />
                </div>
            </div>
            <p>{comment}</p>
        </div>
    );
}