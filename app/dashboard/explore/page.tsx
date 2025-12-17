'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { TreePine, Search, MapPin, Star, ChevronLeft, ChevronRight, Camera, Waves, Mountain, Leaf, TrendingUp } from 'lucide-react';

interface Park {
  id: number;
  name: string;
  province: string;
  image: string;
  rating: number;
  visitors: string;
  emoji: string;
  tags: string[];
  difficulty?: string;
  highlight?: string;
  waterType?: string;
  trail?: string;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for parks
  const popularParks = [
    {
      id: 1,
      name: 'อุทยานแห่งชาติเขาใหญ่',
      province: 'นครราชสีมา',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      rating: 4.8,
      visitors: '2.5M',
      emoji: '🏔️',
      tags: ['ยอดนิยม', 'เดินป่า'],
    },
    {
      id: 2,
      name: 'อุทยานแห่งชาติดอยอินทนนท์',
      province: 'เชียงใหม่',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      rating: 4.9,
      visitors: '1.8M',
      emoji: '⛰️',
      tags: ['ยอดนิยม', 'ถ่ายรูป'],
    },
    {
      id: 3,
      name: 'อุทยานแห่งชาติเอราวัณ',
      province: 'กาญจนบุรี',
      image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
      rating: 4.7,
      visitors: '2.1M',
      emoji: '💧',
      tags: ['น้ำตก', 'ครอบครัว'],
    },
    {
      id: 4,
      name: 'อุทยานแห่งชาติเขาสก',
      province: 'สุราษฎร์ธานี',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      rating: 4.6,
      visitors: '1.2M',
      emoji: '🌳',
      tags: ['ป่าดิบ', 'ผจญภัย'],
    },
    {
      id: 5,
      name: 'อุทยานแห่งชาติภูกระดึง',
      province: 'เลย',
      image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&q=80',
      rating: 4.8,
      visitors: '1.5M',
      emoji: '🌄',
      tags: ['พระอาทิตย์ขึ้น', 'กางเต็นท์'],
    },
    {
      id: 6,
      name: 'อุทยานแห่งชาติแก่งกระจาน',
      province: 'เพชรบุรี',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      rating: 4.7,
      visitors: '980K',
      emoji: '🦜',
      tags: ['ดูนก', 'ทะเลหมอก'],
    },
  ];

  const beginnerParks = [
    {
      id: 7,
      name: 'อุทยานแห่งชาติเฉลิมรัตนโกสินทร์',
      province: 'กาญจนบุรี',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      rating: 4.5,
      visitors: '650K',
      emoji: '🏞️',
      tags: ['มือใหม่', 'เส้นทางง่าย'],
      difficulty: 'ง่าย',
    },
    {
      id: 8,
      name: 'อุทยานแห่งชาติน้ำตกพลิ้ว',
      province: 'จันทบุรี',
      image: 'https://images.unsplash.com/photo-1508253578933-20b529302151?w=800&q=80',
      rating: 4.4,
      visitors: '420K',
      emoji: '🌊',
      tags: ['ครอบครัว', 'น้ำตก'],
      difficulty: 'ง่าย',
    },
    {
      id: 9,
      name: 'อุทยานแห่งชาติทุ่งแสลงหลวง',
      province: 'พิษณุโลก',
      image: 'https://images.unsplash.com/photo-1542181961-9590d0c79dab?w=800&q=80',
      rating: 4.6,
      visitors: '530K',
      emoji: '🌺',
      tags: ['ดอกไม้', 'ถ่ายรูป'],
      difficulty: 'ง่าย',
    },
    {
      id: 10,
      name: 'อุทยานแห่งชาติสามร้อยยอด',
      province: 'ประจวบคีรีขันธ์',
      image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
      rating: 4.5,
      visitors: '380K',
      emoji: '🏖️',
      tags: ['ทะเล', 'มือใหม่'],
      difficulty: 'ง่าย',
    },
  ];

  const photographyParks = [
    {
      id: 11,
      name: 'อุทยานแห่งชาติดอยผาหม่น',
      province: 'เชียงใหม่',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      rating: 4.9,
      visitors: '720K',
      emoji: '📸',
      tags: ['ทะเลหมอก', 'ถ่ายรูปสวย'],
      highlight: 'ทะเลหมอกสวยที่สุด',
    },
    {
      id: 12,
      name: 'อุทยานแห่งชาติภูชี้ฟ้า',
      province: 'เชียงราย',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      rating: 4.8,
      visitors: '890K',
      emoji: '🌅',
      tags: ['พระอาทิตย์ขึ้น', 'วิวสวย'],
      highlight: 'จุดชมวิวตระการตา',
    },
    {
      id: 13,
      name: 'อุทยานแห่งชาติภูหินร่องกล้า',
      province: 'พิษณุโลก',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      rating: 4.7,
      visitors: '640K',
      emoji: '🪨',
      tags: ['ทุ่งหญ้า', 'หินงาม'],
      highlight: 'ทุ่งหญ้าสะวันนา',
    },
    {
      id: 14,
      name: 'อุทยานแห่งชาติแม่ปิง',
      province: 'ลำพูน',
      image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&q=80',
      rating: 4.6,
      visitors: '410K',
      emoji: '🌲',
      tags: ['ป่าสน', 'บรรยากาศดี'],
      highlight: 'ป่าสนสวยงาม',
    },
  ];

  const coastalParks = [
    {
      id: 15,
      name: 'อุทยานแห่งชาติหมู่เกอะสิมิลัน',
      province: 'พังงา',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      rating: 4.9,
      visitors: '1.3M',
      emoji: '🏝️',
      tags: ['เกาะสวย', 'ดำน้ำ'],
      waterType: 'ทะเลอันดามัน',
    },
    {
      id: 16,
      name: 'อุทยานแห่งชาติหาดเจ้าไหม',
      province: 'ตรัง',
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7f44f51?w=800&q=80',
      rating: 4.7,
      visitors: '520K',
      emoji: '🌊',
      tags: ['ชายหาด', 'ถ้ำ'],
      waterType: 'ทะเลอันดามัน',
    },
    {
      id: 17,
      name: 'อุทยานแห่งชาติหาดวนกร',
      province: 'ประจวบคีรีขันธ์',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      rating: 4.6,
      visitors: '780K',
      emoji: '🦀',
      tags: ['หาดทราย', 'ปิกนิก'],
      waterType: 'อ่าวไทย',
    },
    {
      id: 18,
      name: 'อุทยานแห่งชาติอ่าวพังงา',
      province: 'พังงา',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      rating: 4.8,
      visitors: '1.1M',
      emoji: '⛵',
      tags: ['เกาะหิน', 'เรือคายัค'],
      waterType: 'ทะเลอันดามัน',
    },
  ];

  const challengingParks = [
    {
      id: 19,
      name: 'อุทยานแห่งชาติดอยหลวง',
      province: 'เชียงราย',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      rating: 4.7,
      visitors: '340K',
      emoji: '🧗',
      tags: ['ระดับยาก', 'เดินป่า'],
      difficulty: 'ยาก',
      trail: '15 กม.',
    },
    {
      id: 20,
      name: 'อุทยานแห่งชาติน้ำหนาว',
      province: 'เพชรบูรณ์',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      rating: 4.8,
      visitors: '290K',
      emoji: '🥾',
      tags: ['เส้นทางยาว', 'แบกเป้'],
      difficulty: 'ยาก',
      trail: '22 กม.',
    },
    {
      id: 21,
      name: 'อุทยานแห่งชาติแม่วงก์',
      province: 'นครสวรรค์',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      rating: 4.6,
      visitors: '260K',
      emoji: '⛰️',
      tags: ['ปีนเขา', 'ผจญภัย'],
      difficulty: 'ยากมาก',
      trail: '18 กม.',
    },
    {
      id: 22,
      name: 'อุทยานแห่งชาติภูสอยดาว',
      province: 'อุตรดิตถ์',
      image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&q=80',
      rating: 4.7,
      visitors: '310K',
      emoji: '🏔️',
      tags: ['ยอดเขา', 'ท้าทาย'],
      difficulty: 'ยาก',
      trail: '12 กม.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-foreground/5 to-white">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur border-b border-foreground/10 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <TreePine className="w-8 h-8 text-nature-green" />
              <h1 className="text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
            </Link>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="ค้นหาอุทยาน สถานที่ หรือกิจกรรม..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-full focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                />
              </div>
            </div>

            <Link 
              href="/dashboard/trips"
              className="px-5 py-2 bg-nature-green text-white rounded-full font-semibold hover:bg-nature-green/90 transition-colors"
            >
              ทริปของฉัน
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              สำรวจธรรมชาติไทย
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
              ค้นพบอุทยานแห่งชาติที่น่าทึ่งกว่า 100 แห่งทั่วประเทศ
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full font-medium">
                🏔️ 154 อุทยาน
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full font-medium">
                📸 10K+ รูปภาพ
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full font-medium">
                ⭐ 50K+ รีวิว
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12 space-y-16">
        {/* Section 1: Popular Parks */}
        <ParkSection
          title="อุทยานยอดนิยมช่วงนี้"
          subtitle="อุทยานที่คนไทยเข้าชมมากที่สุดในเดือนนี้"
          icon={<TrendingUp className="w-6 h-6" />}
          parks={popularParks}
          color="nature-green"
        />

        {/* Section 2: Beginner Friendly */}
        <ParkSection
          title="เหมาะสำหรับมือใหม่"
          subtitle="อุทยานที่เข้าถึงง่าย เหมาะกับครอบครัวและผู้เริ่มต้น"
          icon={<Leaf className="w-6 h-6" />}
          parks={beginnerParks}
          color="sky-blue"
          showDifficulty
        />

        {/* Section 3: Photography Spots */}
        <ParkSection
          title="สายถ่ายรูปห้ามพลาด"
          subtitle="จุดถ่ายภาพสุดปังที่จะทำให้ IG คุณสวยระเบิด"
          icon={<Camera className="w-6 h-6" />}
          parks={photographyParks}
          color="light-brown"
          showHighlight
        />

        {/* Section 4: Coastal Parks */}
        <ParkSection
          title="ติดทะเล"
          subtitle="อุทยานริมชายฝั่ง สัมผัสลมทะเลและหาดทรายขาว"
          icon={<Waves className="w-6 h-6" />}
          parks={coastalParks}
          color="sky-blue"
          showWaterType
        />

        {/* Section 5: Challenging Trails */}
        <ParkSection
          title="เส้นทางเดินป่าระดับยาก"
          subtitle="ท้าทายตัวเองกับเส้นทางเดินป่าสำหรับนักผจญภัย"
          icon={<Mountain className="w-6 h-6" />}
          parks={challengingParks}
          color="nature-green"
          showTrail
        />
      </div>
    </div>
  );
}

// Reusable Section Component
function ParkSection({ 
  title, 
  subtitle, 
  icon, 
  parks, 
  color,
  showDifficulty = false,
  showHighlight = false,
  showWaterType = false,
  showTrail = false,
}: { 
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  parks: Park[];
  color: string;
  showDifficulty?: boolean;
  showHighlight?: boolean;
  showWaterType?: boolean;
  showTrail?: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section>
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `var(--color-${color})`,
              color: `var(--color-${color})`,
              opacity: 0.15
            }}
          >
            <div style={{ opacity: 6.67 }}>{icon}</div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        </div>
        <p className="text-foreground/60 text-lg ml-14">{subtitle}</p>
      </div>

      {/* Scrollable Cards */}
      <div className="relative group">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>

        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {parks.map((park) => (
            <Link
              key={park.id}
              href={`/dashboard/park/${park.id}`}
              className="flex-shrink-0 w-[320px] group/card"
            >
              <div className="bg-white rounded-2xl shadow-md border border-foreground/5 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={park.image}
                    alt={park.name}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Emoji Badge */}
                  <div className="absolute top-3 left-3 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-2xl shadow-lg">
                    {park.emoji}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{park.rating}</span>
                  </div>

                  {/* Visitors */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-foreground">
                    {park.visitors} คน/ปี
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                    {park.name}
                  </h3>
                  <div className="flex items-center gap-2 text-foreground/60 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{park.province}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {park.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `var(--color-${color})`,
                          color: `var(--color-${color})`,
                          opacity: 0.9
                        }}
                      >
                        <span style={{ opacity: 1.11 }}>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Additional Info */}
                  {showDifficulty && park.difficulty && (
                    <div className="pt-3 border-t border-foreground/10">
                      <span className="text-sm text-foreground/70">
                        ระดับความยาก: <span className="font-semibold text-nature-green">{park.difficulty}</span>
                      </span>
                    </div>
                  )}

                  {showHighlight && park.highlight && (
                    <div className="pt-3 border-t border-foreground/10">
                      <span className="text-sm text-foreground/70">
                        ✨ {park.highlight}
                      </span>
                    </div>
                  )}

                  {showWaterType && park.waterType && (
                    <div className="pt-3 border-t border-foreground/10">
                      <span className="text-sm text-foreground/70">
                        🌊 {park.waterType}
                      </span>
                    </div>
                  )}

                  {showTrail && park.trail && (
                    <div className="pt-3 border-t border-foreground/10 flex items-center justify-between">
                      <span className="text-sm text-foreground/70">เส้นทาง</span>
                      <span className="text-sm font-semibold text-nature-green">{park.trail}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
