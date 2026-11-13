import Link from 'next/link';
import { Compass, ArrowUpRight, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-8 w-full bg-[#073d46] px-6 pb-6 pt-14 text-white">
            <div className="mx-auto grid max-w-7xl gap-10 pb-12 md:grid-cols-[2fr_1fr_1fr]">
                <div>
                    <Link
                        href="/"
                        className="mb-4 inline-flex items-center gap-2 text-2xl font-bold"
                    >
                        <Compass aria-hidden="true" size={26} />
                        DanaGo<span className="text-[#ed9b50]">.</span>
                    </Link>
                    <p className="max-w-sm text-sm leading-7 text-teal-50/70">
                        Mang đến trải nghiệm du lịch tự do, hiện đại và đậm chất
                        địa phương tại thành phố biển đáng sống nhất Việt Nam.
                    </p>
                </div>
                <div>
                    <h2 className="mb-4 text-sm font-semibold">
                        Khám phá Đà Nẵng
                    </h2>
                    <div className="flex flex-col gap-3 text-sm text-teal-50/70">
                        <Link href="/explore" className="hover:text-white">
                            Điểm đến nổi bật
                        </Link>
                        <Link href="/community" className="hover:text-white">
                            Chuyện từ cộng đồng
                        </Link>
                        <Link href="/ai-plan" className="hover:text-white">
                            Gợi ý hành trình với AI
                        </Link>
                    </div>
                </div>
                <div>
                    <h2 className="mb-4 text-sm font-semibold">
                        Chuyến đi của bạn
                    </h2>
                    <div className="flex flex-col gap-3 text-sm text-teal-50/70">
                        <Link href="/itinerary" className="hover:text-white">
                            Lên lịch trình{' '}
                            <ArrowUpRight
                                className="inline"
                                size={14}
                                aria-hidden="true"
                            />
                        </Link>
                        <Link href="/personal" className="hover:text-white">
                            Trang cá nhân
                        </Link>
                        <span className="mt-2 inline-flex items-center gap-2">
                            <MapPin size={14} aria-hidden="true" />
                            Đà Nẵng, Việt Nam
                        </span>
                    </div>
                </div>
            </div>
            <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-xs text-teal-50/50">
                <span>© DanaGo. Khám phá theo cách của bạn.</span>
                <span>Một hành trình, nhiều trải nghiệm.</span>
            </div>
        </footer>
    );
}
