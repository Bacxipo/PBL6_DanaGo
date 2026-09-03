import { NavLink, Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="bg-white shadow-md w-full py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <Link to="/" className="text-[#006971] font-bold text-xl flex items-center gap-2">
                    Smart Trip Đà Nẵng
                </Link>
                <nav className="flex space-x-6 gap-x-8">
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            isActive 
                                ? "text-[#006971] font-bold text-sm border-b-2 border-[#006971] pb-1" 
                                : "text-gray-600 hover:text-[#006971] text-sm font-semibold transition-colors"
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink 
                        to="/explore" 
                        className={({ isActive }) => 
                            isActive 
                                ? "text-[#006971] font-bold text-sm border-b-2 border-[#006971] pb-1" 
                                : "text-gray-600 hover:text-[#006971] text-sm font-semibold transition-colors"
                        }
                    >
                        Explore
                    </NavLink>
                    <a href="#" className="text-gray-600 hover:text-[#006971] text-sm font-semibold">Trip</a>
                    <a href="#" className="text-gray-600 hover:text-[#006971] text-sm font-semibold">Suggestions</a>
                </nav>
                <div>
                    <i className="fa-solid fa-user text-[#006971] text-lg"></i>
                </div>
            </div>
        </header>
    );
}