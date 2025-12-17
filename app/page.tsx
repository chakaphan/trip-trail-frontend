import Link from 'next/link';
import { Map, BookOpen, Award, MapPin, TreePine } from 'lucide-react';

export default function Home() {
  const popularParks = [
    { name: 'เขาใหญ่', province: 'นครราชสีมา', emoji: '🏔️' },
    { name: 'ดอยอินทนนท์', province: 'เชียงใหม่', emoji: '⛰️' },
    { name: 'เอราวัณ', province: 'กาญจนบุรี', emoji: '💧' },
    { name: 'เกาะสิมิลัน', province: 'พังงา', emoji: '🏝️' },
    { name: 'เขาสก', province: 'สุราษฎร์ธานี', emoji: '🌲' },
    { name: 'ภูกระดึง', province: 'เลย', emoji: '🏕️' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-8 h-8 text-white drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">MyNatureJourney</h1>
          </div>
          <Link 
            href="/login"
            className="px-6 py-2 bg-white/90 backdrop-blur text-nature-green rounded-lg hover:bg-white transition-colors font-semibold"
          >
            เข้าสู่ระบบ
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=1920&q=80")',
            filter: 'blur(3px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-2xl">
            บันทึกความทรงจำการเดินทางของคุณ
          </h2>
          
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-lg">
            เก็บรูปภาพ, เส้นทาง, ค่าใช้จ่าย และประสบการณ์การเที่ยวอุทยานในไทย
          </p>

          <Link 
            href="/signup"
            className="inline-block px-10 py-4 bg-nature-green text-white rounded-lg text-lg font-semibold hover:bg-nature-green/90 transition-all shadow-2xl hover:scale-105"
          >
            เริ่มบันทึกทริปของคุณ
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-sky-blue/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: Memory Map */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-foreground/5">
              <div className="w-16 h-16 bg-gradient-to-br from-nature-green to-nature-green/70 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">แผนที่ความทรงจำ</h3>
              <p className="text-foreground/70 text-center leading-relaxed">
                ติดตามเส้นทางการเดินทางของคุณบนแผนที่ 
                ดูภาพรวมสถานที่ที่คุณเคยไปและวางแผนทริปใหม่
              </p>
            </div>

            {/* Feature 2: Trip Diary */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-foreground/5">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-blue to-sky-blue/70 rounded-xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">ไดอารี่ทริป</h3>
              <p className="text-foreground/70 text-center leading-relaxed">
                บันทึกรูปภาพ เรื่องราว ค่าใช้จ่าย และประสบการณ์
                ในแต่ละทริปอย่างละเอียด พร้อมแชร์ให้เพื่อนๆ
              </p>
            </div>

            {/* Feature 3: Badge & Passport */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-foreground/5">
              <div className="w-16 h-16 bg-gradient-to-br from-light-brown to-light-brown/70 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Badge & Passport</h3>
              <p className="text-foreground/70 text-center leading-relaxed">
                รับ Badge จากการท่องเที่ยวอุทยานต่างๆ 
                สะสม Passport ดิจิทัล และปลดล็อกความสำเร็จ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Gallery Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4">สำรวจอุทยานยอดนิยม</h3>
            <p className="text-xl text-foreground/60">คลิกเพื่อดูรายละเอียดและแผนการท่องเที่ยว</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {popularParks.map((park, index) => (
              <Link
                key={index}
                href={`/park/${park.name}`}
                className="group relative bg-gradient-to-br from-nature-green/10 to-sky-blue/10 rounded-2xl p-8 hover:shadow-2xl transition-all hover:scale-105 border-2 border-foreground/5 hover:border-nature-green/30"
              >
                <div className="text-6xl mb-4 text-center">{park.emoji}</div>
                <h4 className="text-2xl font-bold text-center mb-2 group-hover:text-nature-green transition-colors">
                  {park.name}
                </h4>
                <div className="flex items-center justify-center gap-2 text-foreground/60">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm">{park.province}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-nature-green/5 border-t border-foreground/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <TreePine className="w-8 h-8 text-nature-green" />
                <h1 className="text-xl font-bold text-nature-green">MyNatureJourney</h1>
              </div>
              <p className="text-sm text-foreground/60">
                แพลตฟอร์มบันทึกและแชร์ประสบการณ์ท่องเที่ยวธรรมชาติในประเทศไทย
              </p>
            </div>

            {/* About */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">เกี่ยวกับเรา</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/about" className="hover:text-nature-green transition-colors">เกี่ยวกับ MyNatureJourney</Link></li>
                <li><Link href="/team" className="hover:text-nature-green transition-colors">ทีมงาน</Link></li>
                <li><Link href="/blog" className="hover:text-nature-green transition-colors">บล็อก</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/contact" className="hover:text-nature-green transition-colors">ติดต่อสอบถาม</Link></li>
                <li><Link href="/support" className="hover:text-nature-green transition-colors">ศูนย์ช่วยเหลือ</Link></li>
                <li><Link href="/feedback" className="hover:text-nature-green transition-colors">แจ้งปัญหา</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">นโยบาย</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/privacy" className="hover:text-nature-green transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
                <li><Link href="/terms" className="hover:text-nature-green transition-colors">เงื่อนไขการใช้งาน</Link></li>
                <li><Link href="/cookies" className="hover:text-nature-green transition-colors">นโยบายคุกกี้</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-foreground/10 pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2025 MyNatureJourney. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
