import { Star } from "lucide-react";

export default function Rating({ rating = 0 }) {
  const numericRating = Number(rating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={
              star <= Math.round(numericRating)
                ? "fill-orange-400 text-orange-400" // Sao được tô màu
                : "text-gray-300 fill-gray-100"      // Sao chưa đạt (màu xám)
            }
          />
        ))}
      </div>

      <span className="ml-1 text-sm font-semibold text-gray-700">
        {rating}
      </span>
    </div>
  );
}