'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TreePine, MapPin, Calendar, Star, Compass, Edit3, Globe, ArrowLeft } from 'lucide-react';
import { profileService } from '@/app/services/profileService';
import { getMyMemories, getPhotos, getPhotoUrl, type Memory, type Photo } from '@/app/services/memoryService';

const ThailandMap = dynamic(() => import('@/app/components/ThailandMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
});

interface ProfileData {
  id: number;
  user_id: number;
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_file_name?: string;
  avatar_mime_type?: string;
  avatar_file_size?: number;
  cover_file_name?: string;
  cover_mime_type?: string;
  cover_file_size?: number;
  created_at: string;
  updated_at: string;
}

interface StatsData {
  totalTrips: number;
  parksVisited: number;
  totalExpense: number;
  provinces: number;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData>({ totalTrips: 0, parksVisited: 0, totalExpense: 0, provinces: 0 });
  const [recentTrips, setRecentTrips] = useState<Memory[]>([]);
  const [tripPhotos, setTripPhotos] = useState<Record<number, string>>({});
  const [allMemories, setAllMemories] = useState<Memory[]>([]);
  
  // File objects for upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    cover_image: '',
  });

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
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
    } catch (err) {
      // Don't show error for stats, just use defaults
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
            } catch (err) {
              // Error fetching photos
            }
          })
        );
        setTripPhotos(photoUrls);
      }
    } catch (err) {
      // Don't show error, just use empty array
    }
  };

  const fetchAllMemories = async () => {
    try {
      const response = await getMyMemories({ limit: 1000 });
      if (response.memories) {
        setAllMemories(response.memories);
      }
    } catch (err) {
      // Error fetching all memories
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await profileService.getMyProfile();
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setProfile(profileData);
        // Set edit form with current data
        setEditForm({
          name: profileData.name || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          avatar: profileData.avatar || '',
          cover_image: profileData.cover_image || '',
        });
      }
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      
      // Check if error is 404 (profile not found)
      const is404 = err && typeof err === 'object' && 'error' in err 
        && (err as { error: string }).error === 'Profile not found';
      
      if (is404) {
        // Profile not found - set default null and open edit mode
        setProfile(null);
        setIsEditMode(true);
        
        // Get user data from localStorage for default name
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setEditForm({
              name: userData.name || '',
              bio: '',
              location: '',
              website: '',
              avatar: '',
              cover_image: '',
            });
          } catch (e) {
            // Error parsing user data
          }
        }
      } else {
        const errorMessage = err && typeof err === 'object' && 'error' in err 
          ? (err as { error: string }).error 
          : 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError('');

      // Validate required fields
      if (!editForm.name) {
        setError('กรุณากรอกชื่อ');
        setIsSaving(false);
        return;
      }

      // Save profile data (without images)
      const response = await profileService.upsertProfile({
        name: editForm.name,
        bio: editForm.bio || undefined,
        location: editForm.location || undefined,
        website: editForm.website || undefined,
      });

      if (response.data && response.data.data) {
        setProfile(response.data.data);
        
        // Upload avatar if file exists
        if (avatarFile) {
          try {
            await profileService.uploadAvatar(avatarFile);
          } catch (uploadErr) {
            console.error('Error uploading avatar:', uploadErr);
            setError('โปรไฟล์ถูกบันทึกแล้ว แต่ไม่สามารถอัปโหลด avatar ได้');
          }
        }
        
        // Upload cover if file exists
        if (coverFile) {
          try {
            await profileService.uploadCover(coverFile);
          } catch (uploadErr) {
            console.error('Error uploading cover:', uploadErr);
            setError('โปรไฟล์ถูกบันทึกแล้ว แต่ไม่สามารถอัปโหลด cover ได้');
          }
        }
        
        // Refresh profile to get updated image metadata
        await fetchProfile();
        
        // Clear file state
        setAvatarFile(null);
        setCoverFile(null);
        setIsEditMode(false);
      }
    } catch (err: unknown) {
      console.error('Error saving profile:', err);
      const errorMessage = err && typeof err === 'object' && 'error' in err 
        ? (err as { error: string }).error 
        : 'ไม่สามารถบันทึกข้อมูลได้';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current profile data
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        avatar: profile.avatar_file_name 
          ? profileService.getAvatarUrl(profile.user_id)
          : 'https://via.placeholder.com/150',
        cover_image: profile.cover_file_name 
          ? profileService.getCoverUrl(profile.user_id)
          : 'https://via.placeholder.com/1200x400',
      });
    }
    // Clear file selections
    setAvatarFile(null);
    setCoverFile(null);
    setIsEditMode(false);
    setError('');
  };

  // Mock user data (fallback if no profile)
  const user = {
    name: profile?.name || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar_file_name && profile?.user_id
      ? profileService.getAvatarUrl(profile.user_id)
      : 'https://via.placeholder.com/150',
    coverImage: profile?.cover_file_name && profile?.user_id
      ? profileService.getCoverUrl(profile.user_id)
      : 'https://via.placeholder.com/1200x400',
    joinDate: profile?.created_at 
      ? new Date(profile.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
      : '',
    location: profile?.location || '',
    website: profile?.website || '',
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
    }, [] as Array<{ name: string; lat: number; lng: number; trips: number }>);

  // Helper function to format date
  const formatTripDate = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '-';
    
    try {
      // Parse date strings - PostgreSQL returns dates in 'YYYY-MM-DD' format
      // Split and create Date in UTC to avoid timezone shifts
      const [startYear, startMonthNum, startDayNum] = startDate.split('T')[0].split('-').map(Number);
      const [endYear, endMonthNum, endDayNum] = endDate.split('T')[0].split('-').map(Number);
      
      const start = new Date(Date.UTC(startYear, startMonthNum - 1, startDayNum));
      const end = new Date(Date.UTC(endYear, endMonthNum - 1, endDayNum));
      
      const startDay = start.getUTCDate();
      const endDay = end.getUTCDate();
      const startMonth = start.toLocaleDateString('th-TH', { month: 'short', timeZone: 'UTC' });
      const endMonth = end.toLocaleDateString('th-TH', { month: 'short', timeZone: 'UTC' });
      const year = (start.getUTCFullYear() + 543).toString().slice(-2);
      
      // Always show full format with both months
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  };

  const badges = [
    { 
      id: 1, 
      name: 'ผู้พิชิตยอดเขา', 
      description: 'ปีนขึ้นยอดเขาสูงกว่า 1,500 เมตร 5 ครั้ง',
      icon: '⛰️', 
      earned: true,
      rarity: 'epic',
      earnedDate: '15 พ.ย. 67',
      progress: 100,
    },
    { 
      id: 2, 
      name: 'นักถ่ายภาพธรรมชาติ', 
      description: 'อัปโหลดรูปภาพมากกว่า 100 ภาพ',
      icon: '📸', 
      earned: true,
      rarity: 'rare',
      earnedDate: '3 พ.ย. 67',
      progress: 100,
    },
    { 
      id: 3, 
      name: 'นักสำรวจภาคเหนือ', 
      description: 'เยี่ยมชมอุทยานในภาคเหนือ 10 แห่ง',
      icon: '🧭', 
      earned: true,
      rarity: 'rare',
      earnedDate: '28 ต.ค. 67',
      progress: 100,
    },
    { 
      id: 4, 
      name: 'ผู้รักษ์น้ำตก', 
      description: 'เข้าชมน้ำตกที่สวยงาม 15 แห่ง',
      icon: '💦', 
      earned: true,
      rarity: 'common',
      earnedDate: '10 ต.ค. 67',
      progress: 100,
    },
    { 
      id: 5, 
      name: 'ผู้ท้าทายธรรมชาติ', 
      description: 'เดินป่าระดับยากมากกว่า 50 กม.',
      icon: '🥾', 
      earned: true,
      rarity: 'epic',
      earnedDate: '22 ก.ย. 67',
      progress: 100,
    },
    { 
      id: 6, 
      name: 'นักเดินทางทะเล', 
      description: 'เยี่ยมชมอุทยานติดทะเล 8 แห่ง',
      icon: '🌊', 
      earned: true,
      rarity: 'rare',
      earnedDate: '5 ก.ย. 67',
      progress: 100,
    },
    { 
      id: 7, 
      name: 'นักสะสมพระอาทิตย์ขึ้น', 
      description: 'ถ่ายภาพพระอาทิตย์ขึ้นที่อุทยาน 10 แห่ง',
      icon: '🌅', 
      earned: false,
      rarity: 'epic',
      progress: 70,
    },
    { 
      id: 8, 
      name: 'ผู้รู้จักสัตว์ป่า', 
      description: 'พบสัตว์ป่าหายาก 20 ชนิด',
      icon: '🦌', 
      earned: false,
      rarity: 'legendary',
      progress: 45,
    },
    { 
      id: 9, 
      name: 'นักผจญภัยตลอดกาล', 
      description: 'เดินทางทุกเดือนติดต่อกัน 12 เดือน',
      icon: '🎯', 
      earned: false,
      rarity: 'legendary',
      progress: 60,
    },
    { 
      id: 10, 
      name: 'ผู้เชี่ยวชาญถ้ำ', 
      description: 'สำรวจถ้ำในอุทยาน 15 แห่ง',
      icon: '🕳️', 
      earned: false,
      rarity: 'rare',
      progress: 30,
    },
    { 
      id: 11, 
      name: 'มาสเตอร์ธรรมชาติ', 
      description: 'เยี่ยมชมครบทุกอุทยานในประเทศไทย',
      icon: '👑', 
      earned: false,
      rarity: 'legendary',
      progress: 12,
    },
    { 
      id: 12, 
      name: 'นักปีนผา', 
      description: 'ปีนหน้าผา 10 แห่ง',
      icon: '🧗', 
      earned: false,
      rarity: 'epic',
      progress: 20,
    },
  ];

  const handleEditClick = () => {
    setEditForm({
      name: user.name,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar, // For preview only
      cover_image: user.coverImage, // For preview only
    });
    // Reset file selections
    setAvatarFile(null);
    setCoverFile(null);
    setIsEditMode(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, avatar: url });
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, cover_image: url });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-green mx-auto"></div>
          <p className="mt-4 text-foreground/60">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-foreground/5 to-white">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur border-b border-foreground/10 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                title="กลับไปหน้าแดชบอร์ด"
              >
                <ArrowLeft className="w-5 h-5 text-foreground/60" />
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2">
                <TreePine className="w-8 h-8 text-nature-green" />
                <h1 className="text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
              </Link>
            </div>
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-2 px-5 py-2 bg-nature-green text-white rounded-full font-semibold hover:bg-nature-green/90 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              แก้ไขโปรไฟล์
            </button>
          </div>
        </div>
      </header>

      {/* Cover Photo */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${user.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-foreground/10 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-nature-green to-sky-blue">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-1">{user.name}</h1>
              <p className="text-foreground/80 leading-relaxed mb-4 max-w-2xl">{user.bio}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  เข้าร่วมเมื่อ {user.joinDate}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {user.website}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-foreground/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-nature-green mb-1">{stats.totalTrips}</div>
              <div className="text-sm text-foreground/60">ทริปทั้งหมด</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-blue mb-1">{stats.parksVisited}</div>
              <div className="text-sm text-foreground/60">อุทยานที่เที่ยว</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-light-brown mb-1">฿{stats.totalExpense.toLocaleString()}</div>
              <div className="text-sm text-foreground/60">ค่าใช้จ่ายรวม</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-2 border-b border-foreground/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-nature-green border-nature-green'
                : 'text-foreground/60 border-transparent hover:text-foreground'
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'timeline'
                ? 'text-nature-green border-nature-green'
                : 'text-foreground/60 border-transparent hover:text-foreground'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Left: Map & Recent Trips */}
            <div className="space-y-8">
              {/* Personal Map */}
              <div className="bg-white rounded-2xl shadow-md border border-foreground/10 overflow-hidden">
                <div className="p-6 border-b border-foreground/10">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Compass className="w-6 h-6 text-nature-green" />
                    แผนที่การเดินทางของฉัน
                  </h2>
                  <p className="text-foreground/60 mt-1">อุทยานที่ฉันเคยไป ({stats.parksVisited} แห่ง)</p>
                </div>
                
                <div className="p-6">
                  <ThailandMap
                    visitedLocations={visitedLocations.map(loc => ({
                      name: loc.name,
                      lat: loc.lat,
                      lng: loc.lng,
                      province: `${loc.trips} ทริป`
                    }))}
                    bucketList={[]}
                    height="384px"
                  />
                </div>

                <div className="p-4 bg-foreground/5 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-nature-green rounded-full"></div>
                    <span className="text-foreground/70">อุทยานที่เคยไป</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <span className="text-foreground/70">ไปหลายครั้ง</span>
                  </div>
                </div>
              </div>

              {/* Recent Trips */}
              <div className="bg-white rounded-2xl shadow-md border border-foreground/10 p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">ทริปล่าสุด</h2>
                {recentTrips.length === 0 ? (
                  <p className="text-center text-foreground/60 py-8">ยังไม่มีทริป</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {recentTrips.map((trip) => (
                      <Link
                        key={trip.id}
                        href={`/dashboard/trip/${trip.id}`}
                        className="group"
                      >
                        <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                          <img 
                            src={tripPhotos[trip.id] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'} 
                            alt={trip.park_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-nature-green transition-colors">
                          {trip.park_name}
                        </h3>
                        <p className="text-sm text-foreground/60">{formatTripDate(trip.start_date, trip.end_date)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">ไทม์ไลน์การเดินทาง</h2>
            <div className="max-w-3xl">
              <div className="space-y-8">
                {recentTrips.length === 0 ? (
                  <p className="text-center text-foreground/60 py-8">ยังไม่มีทริป</p>
                ) : (
                  recentTrips.map((trip, idx) => (
                    <div key={trip.id} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-nature-green to-sky-blue rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {idx + 1}
                        </div>
                        {idx !== recentTrips.length - 1 && (
                          <div className="w-1 flex-1 bg-gradient-to-b from-nature-green to-sky-blue mt-2"></div>
                        )}
                      </div>
                      <Link href={`/dashboard/trip/${trip.id}`} className="flex-1 group">
                        <div className="bg-white rounded-2xl shadow-md border border-foreground/10 overflow-hidden hover:shadow-xl transition-shadow">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-48 h-48 overflow-hidden">
                              <img 
                              src={tripPhotos[trip.id] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'}
                                alt={trip.park_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-6 flex-1">
                              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-nature-green transition-colors">
                                {trip.park_name}
                              </h3>
                              <p className="text-foreground/60 mb-3">{formatTripDate(trip.start_date, trip.end_date)}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-foreground/10 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-foreground">แก้ไขโปรไฟล์</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  รูปภาพปก
                </label>
                <div className="relative h-48 rounded-xl overflow-hidden bg-foreground/5 group cursor-pointer">
                  <img 
                    src={editForm.cover_image} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label 
                    htmlFor="cover-upload"
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  >
                    <div className="text-center text-white">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold">เปลี่ยนรูปปก</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  รูปโปรไฟล์
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={editForm.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/60">คลิกที่รูปเพื่อเปลี่ยน</p>
                    <p className="text-xs text-foreground/50">รองรับ JPG, PNG (สูงสุด 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="ชื่อของคุณ"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  ประวัติส่วนตัว
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none"
                  placeholder="บอกเล่าเกี่ยวกับตัวคุณ..."
                />
                <p className="text-xs text-foreground/50 mt-1">{editForm.bio.length}/200 ตัวอักษร</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  ที่อยู่
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    placeholder="เช่น กรุงเทพฯ, เชียงใหม่"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  เว็บไซต์
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-foreground/10 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-6 py-2.5 border border-foreground/20 rounded-lg font-semibold text-foreground/70 hover:bg-foreground/5 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-nature-green to-sky-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังบันทึก...
                  </>
                ) : (
                  'บันทึกการเปลี่ยนแปลง'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
