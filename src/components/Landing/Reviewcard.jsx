import { Star } from 'lucide-react';

const ReviewCard = ({ avatar, name, date, message, big = false }) => {
    return (
        // Card container with dynamic height based on 'big' prop
        // 'big' prop determines if the card is tall or short
        <div
            className={`flex flex-col bg-white rounded-2xl shadow-lg p-6 ${
                big ? 'min-h-[280px]' : 'min-h-[200px]'
            }`}
        >
            {/* Header with avatar, name, date, and stars */}
            <div className="flex items-center justify-between mb-4">
                {/* Avatar and user info */}
                <div className="flex items-center gap-3">
                    <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col">
                        <span className="text-base font-semibold">{name}</span>
                        <span className="text-sm text-gray-500">{date}</span>
                    </div>
                </div>
                {/* Stars rating */}
                <div className="flex gap-1 text-yellow-400">
                    {Array(5)
                        .fill()
                        .map((_, i) => (
                            <Star key={i} size={18} fill="currentColor" />
                        ))}
                </div>
            </div>
            <p className="text-base text-gray-700 line-clamp-5">
                {message}
            </p>
            <a href="#" className="text-sm text-blue-600 mt-4 hover:underline self-end">
                Read More
            </a>
        </div>
    );
};

export default ReviewCard;
