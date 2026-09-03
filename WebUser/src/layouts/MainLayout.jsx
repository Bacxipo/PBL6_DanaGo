import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-50">
            <Header />
            <main className="flex-grow p-6 w-full">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}