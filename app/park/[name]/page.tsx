'use client';

import Link from 'next/link';
import { TreePine, MapPin, Calendar, Users, Star, ArrowLeft, TrendingUp, Camera } from 'lucide-react';

interface ParkData {
  name: string;
  province: string;
  region: string;
  established?: string;
  area?: string;
  emoji: string;
  cover: string;
  description: string;
  highlights: string[];
  activities: string[];
  bestTime: string;
  difficulty: string;
  visitors: string;
}

export default function ParkDetailPage({ params }: { params: { name: string } }) {
  const parkName = decodeURIComponent(params.name);

  // Mock park data
  const parkData: { [key: string]: ParkData } = {
    'เขาใหญ่': {
      name: 'อุทยานแห่งชาติเขาใหญ่',
      province: 'นครราชสีมา',
      region: 'ภาคตะวันออกเฉียงเหนือ',
      established: '2505',
      area: '2,168 ตารางกิลโมตร',
      emoji: '🏔️',
      cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
      description: 'อุทยานแห่งชาติเขาใหญ่เป็นหนึ่งในอุทยานแห่งชาติที่ใหญ่ที่สุดในประเทศไทย มีความหลากหลายทางชีวภาพสูง มีป่าดิบเขาและทุ่งหญ้าสลับซับซ้อน เป็นแหล่งท่องเที่ยวที่ได้รับความนิยมมาก',
      highlights: [
        'น้ำตกเหวนรก - น้ำตกที่สวยงามและเป็นสัญลักษณ์',
        'เส้นทางศึกษาธรรมชาติ - เดินป่าชมพันธุ์ไม้',
        'จุดชมวิวผานกสิงห์ - ชมพระอาทิตย์ตก',
        'ทุ่งหญ้านางกวัก - ทุ่งหญ้ากว้างใหญ่',
      ],
      activities: [
        'เดินป่า',
        'ดูนก',
        'ถ่ายภาพธรรมชาติ',
        'ตั้งแคมป์',
      ],
      bestTime: 'พฤศจิกายน - กุมภาพันธ์',
      difficulty: 'กลาง',
      visitors: '1,234',
    },
    'ดอยอินทนนท์': {
      name: 'อุทยานแห่งชาติดอยอินทนนท์',
      province: 'เชียงใหม่',
      region: 'ภาคเหนือ',
      established: '2515',
      area: '482 ตารางกิลโมตร',
      emoji: '⛰️',
      cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
      description: 'ดอยอินทนนท์เป็นยอดเขาที่สูงที่สุดในประเทศไทย มีความสูง 2,565 เมตรจากระดับน้ำทะเล มีอากาศเย็นตลอดปี มีป่าดิบเขาและน้ำตกที่สวยงาม',
      highlights: [
        'ยอดดอยอินทนนท์ - จุดสูงสุดในประเทศไทย',
        'พระมหาธาตุนภเมทนีดล และนภพลพุมสิริ',
        'น้ำตกแม่กลาง - น้ำตกที่สวยงาม',
        'เส้นทาง Kew Mae Pan - ชมทุ่งหญ้าและดอกไม้',
      ],
      activities: [
        'เดินป่า',
        'ชมพระอาทิตย์ขึ้น',
        'ถ่ายภาพ',
        'เยี่ยมชมหมู่บ้านชาวเขา',
      ],
      bestTime: 'พฤศจิกายน - กุมภาพันธ์',
      difficulty: 'ง่าย - กลาง',
      visitors: '2,156',
    },
    'เอราวัณ': {
      name: 'อุทยานแห่งชาติเอราวัณ',
      province: 'กาญจนบุรี',
      region: 'ภาคตะวันตก',
      established: '2518',
      area: '550 ตารางกิลโมตร',
      emoji: '💧',
      cover: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80',
      description: 'อุทยานแห่งชาติเอราวัณมีน้ำตกเอราวัณที่มีชื่อเสียงระดับโลก มี 7 ชั้น น้ำใสสีฟ้าสวยงาม เป็นแหล่งท่องเที่ยวยอดนิยม',
      highlights: [
        'น้ำตกเอราวัณ 7 ชั้น - น้ำตกที่สวยที่สุดในไทย',
        'ถ้ำพระธาตุ - ถ้ำที่มีหินงอกหินย้อย',
        'ลำธาร - เล่นน้ำและพักผ่อน',
      ],
      activities: [
        'เล่นน้ำ',
        'เดินป่า',
        'ถ่ายภาพ',
        'สำรวจถ้ำ',
      ],
      bestTime: 'ตลอดทั้งปี (น้ำมากในหน้าฝน)',
      difficulty: 'ง่าย',
      visitors: '3,421',
    },
  };

  const park = parkData[parkName] || {
    name: parkName,
    province: 'ไม่ระบุ',
    region: 'ไม่ระบุ',
    emoji: '🌳',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    description: 'ข้อมูลอุทยานนี้กำลังอัพเดต',
    highlights: ['กำลังอัพเดตข้อมูล'],
    activities: ['กำลังอัพเดตข้อมูล'],
    bestTime: 'ตลอดทั้งปี',
    difficulty: 'ไม่ระบุ',
    visitors: '0',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white">
      {/* Header */}
      <header className="bg-white border-b border-foreground/10 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-foreground/5 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-foreground/70" />
              </Link>
              <Link href="/" className="flex items-center gap-2">
                <TreePine className="w-8 h-8 text-nature-green" />
                <h1 className="text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
              </Link>
            </div>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${park.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-6xl drop-shadow-lg">{park.emoji}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
              {park.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {park.province} - {park.region}
              </span>
              {park.established && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  ก่อตั้ง พ.ศ. {park.established}
                </span>
              )}
              {park.area && (
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {park.area}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">เกี่ยวกับอุทยาน</h2>
              <p className="text-foreground/80 leading-relaxed text-lg">
                {park.description}
              </p>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">จุดเด่น</h2>
              <ul className="space-y-3">
                {park.highlights?.map((highlight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-nature-green flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">กิจกรรมแนะนำ</h2>
              <div className="flex flex-wrap gap-3">
                {park.activities?.map((activity: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-nature-green/10 to-sky-blue/10 text-nature-green rounded-full font-medium border border-nature-green/20"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">ข้อมูลสำคัญ</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">ช่วงเวลาที่แนะนำ</p>
                    <p className="font-semibold text-foreground">{park.bestTime}</p>
                  </div>
                  <div className="border-t border-foreground/10" />
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">ระดับความยาก</p>
                    <p className="font-semibold text-foreground">{park.difficulty}</p>
                  </div>
                  <div className="border-t border-foreground/10" />
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">ผู้เยี่ยมชมในแอป</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-nature-green" />
                      <p className="font-semibold text-foreground">{park.visitors} คน</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-nature-green/10 to-sky-blue/10 rounded-2xl border-2 border-nature-green/20 p-6">
                <Camera className="w-12 h-12 text-nature-green mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">เคยมาแล้ว?</h3>
                <p className="text-foreground/70 mb-4">บันทึกและแชร์ประสบการณ์การเดินทางของคุณ</p>
                <Link
                  href="/login"
                  className="block w-full px-6 py-3 bg-nature-green text-white text-center rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
                >
                  เริ่มบันทึกทริป
                </Link>
              </div>

              {/* Share */}
              <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">แชร์อุทยานนี้</h3>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 transition-colors text-sm font-semibold">
                    Facebook
                  </button>
                  <button className="flex-1 px-4 py-2 bg-[#00B900] text-white rounded-lg hover:bg-[#00B900]/90 transition-colors text-sm font-semibold">
                    Line
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
