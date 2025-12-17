'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TreePine, Search, Plus, MapPin, Calendar, Filter, X, User, LogOut, ArrowLeft } from 'lucide-react';
import { getMyMemories, getPhotos, getPhotoUrl, type Memory } from '@/app/services/memoryService';
import { authService } from '@/app/services/authService';

interface MemoryWithPhoto extends Memory {
  firstPhotoId?: number;
}

export default function TripsPage() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCompanion, setSelectedCompanion] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [trips, setTrips] = useState<MemoryWithPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch trips from API
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await getMyMemories();
        
        // Fetch first photo for each trip
        const tripsWithPhotos = await Promise.all(
          response.memories.map(async (memory) => {
            if (memory.photo_count && memory.photo_count > 0) {
              try {
                const photos = await getPhotos(memory.id);
                const firstPhotoId = photos.photos[0]?.id;
                return { ...memory, firstPhotoId };
              } catch (err) {
                return memory;
              }
            }
            return memory;
          })
        );
        
        setTrips(tripsWithPhotos);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลทริปได้');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Helper function to get Thai month abbreviation
  const getThaiMonth = (dateString: string) => {
    const date = new Date(dateString);
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return thaiMonths[date.getMonth()];
  };

  // Helper function to format date as dd/MM/yyyy
  const formatDate = (dateString: string) => {
    // Convert to local date to handle timezone correctly
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter options
  const months = ['all', 'ธ.ค.', 'พ.ย.', 'ต.ค.', 'ก.ย.', 'ส.ค.', 'ก.ค.', 'มิ.ย.', 'พ.ค.', 'เม.ย.', 'มี.ค.', 'ก.พ.', 'ม.ค.'];
  const locations = ['all', ...new Set(trips.map(trip => trip.park_name))];

  // Filter trips
  const filteredTrips = trips.filter(trip => {
    // Month filter
    if (selectedMonth !== 'all') {
      const tripMonth = getThaiMonth(trip.start_date);
      if (tripMonth !== selectedMonth) return false;
    }

    // Location filter
    if (selectedLocation !== 'all' && trip.park_name !== selectedLocation) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedLocation('all');
    setSelectedType('all');
    setSelectedCompanion('all');
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('user');
    router.push('/login');
  };

  const activeFiltersCount = [selectedMonth, selectedLocation, selectedType, selectedCompanion].filter(f => f !== 'all').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white">
      {/* Top Bar */}
      <header className="bg-white border-b border-foreground/10 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/dashboard" className="p-1.5 md:p-2 hover:bg-foreground/5 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground/70" />
              </Link>
              <div className="flex items-center gap-2">
                <TreePine className="w-7 h-7 md:w-8 md:h-8 text-nature-green" />
                <h1 className="text-xl md:text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
              </div>
            </div>
            
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="ค้นหาทริป..."
                  className="w-full pl-11 pr-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link 
                href="/dashboard/explore"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 border border-nature-green text-nature-green rounded-lg hover:bg-nature-green/5 transition-colors font-semibold"
              >
                สำรวจอุทยาน
              </Link>

              <Link 
                href="/dashboard/create-memory"
                className="flex items-center gap-2 px-5 py-2.5 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">เพิ่มทริป</span>
              </Link>
              
              {/* User Avatar with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 bg-gradient-to-br from-nature-green to-sky-blue rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all"
                >
                  A
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-foreground/10 py-2 z-50">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/5 transition-colors text-foreground/80"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>โปรไฟล์</span>
                    </Link>
                    <hr className="my-1 border-foreground/10" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">ทริปทั้งหมดของคุณ</h2>
          <p className="text-foreground/60">สำรวจและจัดการความทรงจำการเดินทางของคุณ</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters ? 'bg-nature-green text-white' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                <Filter className="w-4 h-4" />
                ตัวกรอง
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/60 hover:text-foreground/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            <div className="text-sm text-foreground/60">
              แสดง <span className="font-semibold text-nature-green">{filteredTrips.length}</span> ทริป
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-foreground/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">เดือน</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green text-sm"
                >
                  <option value="all">ทั้งหมด</option>
                  {months.slice(1).map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">สถานที่</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green text-sm"
                >
                  <option value="all">ทั้งหมด</option>
                  {locations.slice(1).map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

            </div>
          )}
        </div>

        {/* Trip Cards Grid - Pinterest Style */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-nature-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-500 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-foreground/60">{error}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/dashboard/trip/${trip.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-foreground/5"
              >
                {/* Cover Photo */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-nature-green/10 to-sky-blue/10">
                  {trip.firstPhotoId ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getPhotoUrl(trip.id, trip.firstPhotoId)}
                      alt={trip.park_name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      🏞️
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Park Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-nature-green transition-colors">
                    {trip.park_name}
                  </h3>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-foreground/60 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-foreground/50">
                    <span>{trip.duration_days} วัน</span>
                    <span>💰 {Number(trip.total_expense).toLocaleString()} ฿</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-foreground/60 mb-2">ไม่พบทริปที่ตรงกับตัวกรอง</h3>
            <p className="text-foreground/40 mb-6">ลองเปลี่ยนตัวกรองหรือเพิ่มทริปใหม่</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
            >
              ล้างตัวกรอง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
