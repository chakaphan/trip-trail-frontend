'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TreePine, Plus, MapPin, Search, Navigation, Mountain, User, LogOut } from 'lucide-react';
import { authService } from '@/app/services/authService';
import { profileService } from '@/app/services/profileService';
import { getMyMemories, getPhotos, getPhotoUrl, type Memory } from '@/app/services/memoryService';

const ThailandMap = dynamic(() => import('@/app/components/ThailandMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-lg"></div>
});

export default function DashboardPage() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for real data
  const [stats, setStats] = useState({ totalTrips: 0, parksVisited: 0, totalExpense: 0, provinces: 0 });
  const [recentTrips, setRecentTrips] = useState<Memory[]>([]);
  const [tripPhotos, setTripPhotos] = useState<Record<number, string>>({});
  const [allMemories, setAllMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch data on mount
  useEffect(() => {
    fetchStats();
    fetchRecentTrips();
    fetchAllMemories();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await profileService.getMyStats();
      if (response.data && response.data.data) {
        setStats(response.data.data);
      }
    } catch {
      // Error fetching stats
    }
  };

  const fetchRecentTrips = async () => {
    try {
      const response = await getMyMemories({ limit: 3 });
      if (response.memories) {
        setRecentTrips(response.memories);
        
        // Fetch first photo for each trip
        const photoUrls: Record<number, string> = {};
        await Promise.all(
          response.memories.map(async (trip) => {
            try {
              const photosResponse = await getPhotos(trip.id);
              if (photosResponse.photos && photosResponse.photos.length > 0) {
                photoUrls[trip.id] = getPhotoUrl(trip.id, photosResponse.photos[0].id);
              }
            } catch {
              // Error fetching photos
            }
          })
        );
        setTripPhotos(photoUrls);
      }
    } catch {
      // Error fetching recent trips
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMemories = async () => {
    try {
      const response = await getMyMemories({ limit: 1000 });
      if (response.memories) {
        setAllMemories(response.memories);
      }
    } catch {
      // Error fetching all memories
    }
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Helper function to format date
  const formatTripDate = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '-';
    
    try {
      const [startYear, startMonthNum, startDayNum] = startDate.split('T')[0].split('-').map(Number);
      const [endYear, endMonthNum, endDayNum] = endDate.split('T')[0].split('-').map(Number);
      
      const start = new Date(Date.UTC(startYear, startMonthNum - 1, startDayNum));
      const end = new Date(Date.UTC(endYear, endMonthNum - 1, endDayNum));
      
      const startDay = start.getUTCDate();
      const endDay = end.getUTCDate();
      const startMonth = start.toLocaleDateString('th-TH', { month: 'short', timeZone: 'UTC' });
      const endMonth = end.toLocaleDateString('th-TH', { month: 'short', timeZone: 'UTC' });
      const year = (start.getUTCFullYear() + 543).toString().slice(-2);
      
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    } catch {
      return `${startDate} - ${endDate}`;
    }
  };

  // Generate visited locations from memories with location data
  const visitedLocations = allMemories
    .filter(memory => memory.location_lat && memory.location_lng)
    .reduce((acc, memory) => {
      const existing = acc.find(loc => loc.name === memory.park_name);
      if (existing) {
        existing.trips += 1;
      } else {
        acc.push({
          name: memory.park_name,
          lat: memory.location_lat!,
          lng: memory.location_lng!,
          trips: 1
        });
      }
      return acc;
    }, [] as Array<{ name: string; lat: number; lng: number; trips: number }>)
    .map(loc => ({
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      province: `${loc.trips} ทริป`
    }));

  const bucketList: Array<{ name: string; lat: number; lng: number; province: string }> = [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white pb-20 md:pb-0">
      {/* Top Bar */}
      <header className="bg-white border-b border-foreground/10 sticky top-0 z-20 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3 md:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <TreePine className="w-7 h-7 md:w-8 md:h-8 text-nature-green" />
              <h1 className="text-xl md:text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
            </Link>
            
            {/* Search Bar - Hidden on mobile, use icon instead */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="ค้นหาทริป, สถานที่, หรืออุทยาน..."
                  className="w-full pl-11 pr-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Search Icon for Mobile */}
            <button className="md:hidden p-2 hover:bg-foreground/5 rounded-lg transition-colors">
              <Search className="w-6 h-6 text-foreground/60" />
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <Link 
                href="/dashboard/create-memory"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">เพิ่มทริป</span>
              </Link>
              
              {/* User Avatar with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-nature-green to-sky-blue rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all"
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

      {/* Main Content - Mobile First: Single Column Scroll */}
      <div className="md:flex md:h-[calc(100vh-73px)]">
        {/* Mobile: Vertical Scroll Layout */}
        <div className="md:hidden space-y-6 p-4">
          {/* Quick Stats Cards - Larger for Mobile */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">สถิติของคุณ</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Total Trips */}
              <div className="bg-white rounded-2xl shadow-md p-5 border border-foreground/5 active:scale-95 transition-transform">
                <div className="w-12 h-12 bg-nature-green/10 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <Mountain className="w-6 h-6 text-nature-green" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-nature-green mb-1">{stats.totalTrips}</div>
                  <div className="text-sm text-foreground/60">ทริปทั้งหมด</div>
                </div>
              </div>

              {/* Total Distance */}
              <div className="bg-white rounded-2xl shadow-md p-5 border border-foreground/5 active:scale-95 transition-transform">
                <div className="w-12 h-12 bg-sky-blue/10 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <Navigation className="w-6 h-6 text-sky-blue" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sky-blue mb-1">{stats.totalExpense.toLocaleString()}</div>
                  <div className="text-sm text-foreground/60">฿ ใช้จ่าย</div>
                </div>
              </div>

              {/* Parks Visited */}
              <div className="bg-white rounded-2xl shadow-md p-5 border border-foreground/5 active:scale-95 transition-transform">
                <div className="w-12 h-12 bg-light-brown/10 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <TreePine className="w-6 h-6 text-light-brown" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-light-brown mb-1">{stats.parksVisited}</div>
                  <div className="text-sm text-foreground/60">อุทยาน</div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section - Compact for Mobile */}
          <div className="bg-white rounded-2xl shadow-md border border-foreground/5 overflow-hidden">
            <div className="p-4 border-b border-foreground/10 bg-gradient-to-r from-nature-green/5 to-sky-blue/5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-nature-green" />
                แผนที่การเดินทาง
              </h2>
            </div>

            <div className="p-4">
              <ThailandMap
                visitedLocations={visitedLocations}
                bucketList={bucketList}
                height="256px"
              />
            </div>
          </div>

          {/* Recent Trips - Large Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">ทริปล่าสุด</h3>
              <Link href="/dashboard/trips" className="text-nature-green font-semibold text-sm hover:underline">
                ดูทั้งหมด
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-foreground/60">กำลังโหลด...</div>
              ) : recentTrips.length === 0 ? (
                <div className="text-center py-8 text-foreground/60">ยังไม่มีทริป</div>
              ) : (
                recentTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/dashboard/trip/${trip.id}`}
                    className="block bg-white rounded-2xl shadow-md border border-foreground/5 overflow-hidden active:scale-98 transition-transform"
                  >
                    <div className="flex items-center p-4 gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-nature-green/10 to-sky-blue/10 rounded-xl overflow-hidden flex-shrink-0">
                        {tripPhotos[trip.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tripPhotos[trip.id]} alt={trip.park_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🏔️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-foreground mb-1 truncate">{trip.park_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.duration_days} วัน</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-foreground/50">
                          <span>{formatTripDate(trip.start_date, trip.end_date)}</span>
                        </div>
                      </div>
                      <div className="text-nature-green">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Original 60/40 Split Layout */}
        <div className="hidden md:flex md:w-[60%] p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-foreground/5 overflow-hidden h-full w-full">
            {/* Map Header */}
            <div className="p-6 border-b border-foreground/10 bg-gradient-to-r from-nature-green/5 to-sky-blue/5">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-nature-green" />
                แผนที่การเดินทาง
              </h2>
              <p className="text-foreground/60 text-sm">สำรวจสถานที่ที่คุณเคยไปและวางแผนทริปใหม่</p>
            </div>

            {/* Map Content */}
            <div className="p-6">
              <ThailandMap
                visitedLocations={visitedLocations}
                bucketList={bucketList}
                height="500px"
              />
            </div>
          </div>
        </div>

        {/* Right: Stats & Recent Trips (40%) - Desktop Only */}
        <div className="hidden md:block md:w-[40%] bg-foreground/[0.02] p-6 overflow-y-auto border-l border-foreground/10">
          <div className="space-y-6">
            {/* Quick Stats */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">สถิติของคุณ</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Total Trips */}
                <div className="bg-white rounded-xl shadow-md p-5 border border-foreground/5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-nature-green/10 rounded-lg flex items-center justify-center">
                      <Mountain className="w-5 h-5 text-nature-green" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-nature-green">{stats.totalTrips}</div>
                      <div className="text-xs text-foreground/60">ทริปทั้งหมด</div>
                    </div>
                  </div>
                </div>

                {/* Total Distance */}
                <div className="bg-white rounded-xl shadow-md p-5 border border-foreground/5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-sky-blue/10 rounded-lg flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-sky-blue" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-sky-blue">{stats.totalExpense.toLocaleString()}</div>
                      <div className="text-xs text-foreground/60">฿ ใช้จ่าย</div>
                    </div>
                  </div>
                </div>

                {/* Parks Visited */}
                <div className="bg-white rounded-xl shadow-md p-5 border border-foreground/5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-light-brown/10 rounded-lg flex items-center justify-center">
                      <TreePine className="w-5 h-5 text-light-brown" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-light-brown">{stats.parksVisited}</div>
                      <div className="text-xs text-foreground/60">อุทยาน</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trips */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">ทริปล่าสุด</h3>
                <Link href="/dashboard/trips" className="text-sm text-nature-green hover:text-nature-green/80 font-medium">
                  ดูทั้งหมด
                </Link>
              </div>
              
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-foreground/60">กำลังโหลด...</div>
                ) : recentTrips.length === 0 ? (
                  <div className="text-center py-8 text-foreground/60">ยังไม่มีทริป</div>
                ) : (
                  recentTrips.map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/dashboard/trip/${trip.id}`}
                      className="block bg-white rounded-xl p-4 shadow-sm border border-foreground/5 hover:shadow-md hover:border-nature-green/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-nature-green/10 to-sky-blue/10 flex-shrink-0">
                          {tripPhotos[trip.id] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tripPhotos[trip.id]} alt={trip.park_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🏔️</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground group-hover:text-nature-green transition-colors truncate">
                            {trip.park_name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-foreground/60 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {trip.duration_days} วัน
                            </span>
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {trip.total_expense?.toLocaleString() || 0} ฿
                            </span>
                          </div>
                          <p className="text-xs text-foreground/40 mt-1">{formatTripDate(trip.start_date, trip.end_date)}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}

                {/* Add New Trip Card */}
                <Link
                  href="/dashboard/create-memory"
                  className="block bg-gradient-to-br from-nature-green/5 to-sky-blue/5 rounded-xl p-6 border-2 border-dashed border-nature-green/30 hover:border-nature-green hover:shadow-md transition-all text-center group"
                >
                  <Plus className="w-8 h-8 text-nature-green mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-nature-green">เพิ่มทริปใหม่</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
