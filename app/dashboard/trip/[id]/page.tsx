'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TreePine, ArrowLeft, Calendar, Share2, MessageCircle, Copy, Check, Navigation, User, LogOut, Edit, X, Trash2, Upload, MapPin, ImageIcon, FileText, Lock, Users, Globe, Plus, DollarSign } from 'lucide-react';
import { TimelineItem } from '@/app/components/UIComponents';
import { getMemoryById, getPhotos, getPhotoUrl, getTimelines, getTimelinePhotoUrl, updateMemory, deletePhoto, uploadPhoto, type Memory, type Photo, type Timeline } from '@/app/services/memoryService';
import { authService } from '@/app/services/authService';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<Memory | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditStep, setCurrentEditStep] = useState(1);
  const [editForm, setEditForm] = useState({
    park_name: '',
    start_date: '',
    end_date: '',
    duration_days: 0,
    location_lat: undefined as number | undefined,
    location_lng: undefined as number | undefined,
    impression: '',
    tips: '',
    privacy_level: 'private' as 'private' | 'friends' | 'public',
    places: [''] as string[],
    expenses: [
      { category: 'ค่าเข้าอุทยาน', amount: '' },
      { category: 'ที่พัก', amount: '' },
      { category: 'อาหาร', amount: '' },
      { category: 'เดินทาง', amount: '' },
    ] as Array<{ category: string; amount: string }>
  });
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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

  // Fetch trip data from API
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        const memoryId = parseInt(resolvedParams.id);
        
        // Fetch memory details
        const memoryResponse = await getMemoryById(memoryId);
        setTrip(memoryResponse.memory);
        
        // Fetch photos
        const photosResponse = await getPhotos(memoryId);
        setPhotos(photosResponse.photos);
        
        // Fetch timelines
        try {
          const timelinesResponse = await getTimelines(memoryId);
          setTimelines(timelinesResponse.timelines);
        } catch {
          // Timeline is optional, so we don't set error state
        }
      } catch {
        setError('ไม่สามารถโหลดข้อมูลทริปได้');
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [resolvedParams.id]);

  // Populate edit form when trip data changes
  useEffect(() => {
    if (trip) {
      // Define standard expense categories like create-memory
      const standardCategories = ['ค่าเข้าอุทยาน', 'ที่พัก', 'อาหาร', 'เดินทาง'];
      
      // Create expenses array with all standard categories
      const expensesMap = new Map<string, string>(
        trip.expenses?.map(e => [e.category, String(e.amount)]) || []
      );
      
      const expenses = standardCategories.map(category => ({
        category,
        amount: expensesMap.get(category) || ''
      }));

      // Get places or default to one empty string
      const places = (trip.places && trip.places.length > 0) 
        ? trip.places.map(p => p.place_name) 
        : [''];
      
      setEditForm({
        park_name: trip.park_name,
        start_date: trip.start_date.split('T')[0],
        end_date: trip.end_date.split('T')[0],
        duration_days: trip.duration_days,
        location_lat: trip.location_lat,
        location_lng: trip.location_lng,
        impression: trip.impression || '',
        tips: trip.tips || '',
        privacy_level: trip.privacy_level as 'private' | 'friends' | 'public',
        places,
        expenses
      });
    }
  }, [trip]);

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (editForm.start_date && editForm.end_date) {
      const start = new Date(editForm.start_date);
      const end = new Date(editForm.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setEditForm(prev => ({ ...prev, duration_days: diffDays }));
    }
  }, [editForm.start_date, editForm.end_date]);

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;

    // Validate dates
    if (editForm.start_date && editForm.end_date) {
      const startDate = new Date(editForm.start_date);
      const endDate = new Date(editForm.end_date);
      
      if (endDate < startDate) {
        alert('วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น');
        return;
      }
    }

    try {
      // Filter out empty places before submitting (like create-memory does)
      const filteredPlaces = (editForm.places || []).filter(place => place.trim() !== '');
      
      // Convert expenses amount from string to number and filter out empty amounts
      const expensesData = (editForm.expenses || [])
        .filter(exp => exp.amount !== '')
        .map(exp => ({
          category: exp.category,
          amount: parseFloat(exp.amount)
        }));
      
      const response = await updateMemory(trip.id, {
        ...editForm,
        places: filteredPlaces,
        expenses: expensesData
      });
      
      setTrip(response.memory);
      setShowEditModal(false);
      setCurrentEditStep(1); // Reset to step 1 for next time
      
      // Refresh page data
      const photosResponse = await getPhotos(trip.id);
      setPhotos(photosResponse.photos);
    } catch {
      alert('ไม่สามารถแก้ไขข้อมูลได้');
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-nature-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-red-500 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-foreground/60 mb-6">{error || 'ไม่พบข้อมูลทริป'}</p>
          <Link
            href="/dashboard/trips"
            className="px-6 py-3 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold inline-block"
          >
            กลับไปหน้าทริป
          </Link>
        </div>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !trip) return;

    setUploadingPhotos(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadPhoto(trip.id, file)
      );
      await Promise.all(uploadPromises);
      
      // Refresh photos
      const photosResponse = await getPhotos(trip.id);
      setPhotos(photosResponse.photos);
    } catch {
      alert('ไม่สามารถอัปโหลดรูปภาพได้');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  // Handle photo delete
  const handlePhotoDelete = async (photoId: number) => {
    if (!trip) return;
    
    if (!confirm('คุณต้องการลบรูปภาพนี้หรือไม่?')) return;

    try {
      await deletePhoto(trip.id, photoId);
      
      // Refresh photos
      const photosResponse = await getPhotos(trip.id);
      setPhotos(photosResponse.photos);
    } catch {
      alert('ไม่สามารถลบรูปภาพได้');
    }
  };

  // Handle add place
  const addPlace = () => {
    setEditForm({ ...editForm, places: [...(editForm.places || []), ''] });
  };

  // Handle update place
  const updatePlace = (index: number, value: string) => {
    const updated = [...(editForm.places || [])];
    updated[index] = value;
    setEditForm({ ...editForm, places: updated });
  };

  // Handle remove place
  const removePlace = (index: number) => {
    setEditForm({
      ...editForm,
      places: (editForm.places || []).filter((_, i) => i !== index)
    });
  };

  // Geocode park name
  const handleGeocodeLocation = async () => {
    if (!editForm.park_name.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(editForm.park_name + ' Thailand')}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setEditForm({
          ...editForm,
          location_lat: parseFloat(data[0].lat),
          location_lng: parseFloat(data[0].lon)
        });
      } else {
        alert('ไม่พบพิกัดสำหรับอุทยานนี้');
      }
    } catch {
      alert('ไม่สามารถค้นหาพิกัดได้');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur border-b border-foreground/10 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/trips" className="p-2 hover:bg-foreground/5 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-foreground/70" />
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2">
                <TreePine className="w-8 h-8 text-nature-green" />
                <h1 className="text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
              </Link>
            </div>

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
      </header>

      {/* Cover Photo - Full Width */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {photos.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={getPhotoUrl(trip.id, photos[0].id)}
            alt={trip.park_name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-nature-green/20 to-sky-blue/20 flex items-center justify-center">
            <span className="text-8xl">🏞️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Edit Button - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white/95 text-foreground rounded-xl transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Edit className="w-4 h-4" />
            <span>แก้ไขทริป</span>
          </button>
        </div>

        {/* Cover Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-6xl drop-shadow-lg">🏞️</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
              {trip.park_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </span>
              <span className="flex items-center gap-2">
                📅 {trip.duration_days} วัน
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Storyline (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            {trip.impression && (
              <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">ความประทับใจ</h2>
                <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                  {trip.impression}
                </p>
              </div>
            )}

            {/* Photos Gallery */}
            {photos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  ภาพถ่าย ({photos.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPhotoUrl(trip.id, photo.id)}
                        alt={`Photo ${photo.id}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-6">
              {/* Timeline Header with Add Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Timeline การเดินทาง</h2>
                <Link
                  href={`/dashboard/trip/${resolvedParams.id}/add-timeline`}
                  className="flex items-center gap-2 px-4 py-2 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
                >
                  <span className="text-lg">+</span>
                  เพิ่ม Timeline
                </Link>
              </div>

              {/* Timeline Items */}
              {timelines.length > 0 ? (
                <div className="space-y-0">
                  {timelines.map((timeline, index) => (
                    <TimelineItem
                      key={timeline.id}
                      time={timeline.time_label}
                      title={timeline.title}
                      description={timeline.description}
                      photos={timeline.photos?.map(photo => 
                        getTimelinePhotoUrl(trip.id, timeline.id, photo.id)
                      )}
                      location={timeline.location_name && timeline.location_lat && timeline.location_lng ? {
                        name: timeline.location_name,
                        lat: timeline.location_lat,
                        lng: timeline.location_lng
                      } : undefined}
                      isLast={index === timelines.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-8 text-center">
                  <p className="text-foreground/60">ยังไม่มี Timeline</p>
                  <p className="text-sm text-foreground/40 mt-2">คลิกปุ่ม &quot;เพิ่ม Timeline&quot; เพื่อเริ่มต้น</p>
                </div>
              )}
            </div>

            {/* Tips Section */}
            {trip.tips && (
              <div className="bg-gradient-to-br from-nature-green/5 to-sky-blue/5 rounded-2xl border-2 border-nature-green/20 p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  💡 Tips สำหรับคนที่จะไป
                </h3>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {trip.tips}
                </p>
              </div>
            )}
          </div>

          {/* Right: Trip Summary (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-foreground/5 p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">สรุปทริป</h3>
                
                <div className="space-y-4">
                  {/* Park */}
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">อุทยาน</p>
                    <p className="font-semibold text-foreground">{trip.park_name}</p>
                  </div>

                  <div className="border-t border-foreground/10" />

                  {/* Dates */}
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">วันที่ไป</p>
                    <p className="font-semibold text-foreground">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
                    <p className="text-sm text-foreground/70">{trip.duration_days} วัน</p>
                  </div>

                  <div className="border-t border-foreground/10" />

                  {/* Places Visited */}
                  {trip.places && trip.places.length > 0 && (
                    <>
                      <div>
                        <p className="text-sm text-foreground/60 mb-2">สถานที่ที่แวะ</p>
                        <ul className="space-y-2">
                          {trip.places.map((place) => (
                            <li key={place.id} className="flex items-center gap-2 text-sm text-foreground/80">
                              <Navigation className="w-3 h-3 text-nature-green" />
                              {place.place_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-foreground/10" />
                    </>
                  )}

                  {/* Total Expense */}
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">ค่าใช้จ่ายรวม</p>
                    <div className="bg-gradient-to-r from-nature-green/10 to-sky-blue/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-nature-green">
                          {Number(trip.total_expense).toLocaleString()} ฿
                        </span>
                      </div>
                      {trip.expenses && trip.expenses.length > 0 && (
                        <div className="space-y-1">
                          {trip.expenses.map((expense) => (
                            <div key={expense.id} className="flex justify-between text-xs text-foreground/60">
                              <span>{expense.category}</span>
                              <span>{Number(expense.amount).toLocaleString()} ฿</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-foreground/10" />

                  {/* Privacy Level */}
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">การมองเห็น</p>
                    <span className="inline-flex items-center px-3 py-1 bg-foreground/5 text-foreground text-sm font-medium rounded-full">
                      {trip.privacy_level === 'public' ? '🌍 สาธารณะ' : 
                       trip.privacy_level === 'friends' ? '👥 เพื่อน' : 
                       '🔒 ส่วนตัว'}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 space-y-8">
          {/* Share Buttons */}
          <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">แชร์ทริปนี้</h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 transition-colors font-semibold">
                <Share2 className="w-5 h-5" />
                Facebook
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-[#00B900] text-white rounded-lg hover:bg-[#00B900]/90 transition-colors font-semibold">
                <MessageCircle className="w-5 h-5" />
                Line
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-5 py-3 bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors rounded-lg font-semibold"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
              </button>
            </div>
          </div>

          {/* Comments Section - Coming Soon */}
          <div className="bg-white rounded-2xl shadow-md border border-foreground/5 p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">
              ความคิดเห็น
            </h3>
            <div className="text-center py-8 text-foreground/60">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-foreground/30" />
              <p>ฟีเจอร์ความคิดเห็นกำลังจะมาเร็วๆ นี้...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white border-b border-foreground/10 px-6 py-4 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">แก้ไขทริป</h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-foreground/60 font-medium">
                    ขั้นตอน {currentEditStep} จาก 4
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setCurrentEditStep(1);
                    }}
                    className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-foreground/60" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-4 border-b border-foreground/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                {[
                  { number: 1, title: 'ข้อมูลพื้นฐาน', icon: MapPin },
                  { number: 2, title: 'รูปภาพ', icon: ImageIcon },
                  { number: 3, title: 'รายละเอียด', icon: FileText },
                  { number: 4, title: 'การแชร์', icon: Lock }
                ].map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all cursor-pointer ${
                          currentEditStep > step.number
                            ? 'bg-nature-green text-white'
                            : currentEditStep === step.number
                            ? 'bg-nature-green text-white ring-4 ring-nature-green/20'
                            : 'bg-foreground/10 text-foreground/40'
                        }`}
                        onClick={() => setCurrentEditStep(step.number)}
                      >
                        {currentEditStep > step.number ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        currentEditStep >= step.number ? 'text-nature-green' : 'text-foreground/40'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                        currentEditStep > step.number ? 'bg-nature-green' : 'bg-foreground/10'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleEditSubmit} className="p-6">
              {/* Step 1: Basic Info */}
              {currentEditStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">ข้อมูลพื้นฐาน</h3>
                    <p className="text-foreground/60 text-sm">แก้ไขชื่อสถานที่และวันที่เดินทาง</p>
                  </div>

              {/* Park Name */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  ชื่ออุทยาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.park_name}
                  onChange={(e) => setEditForm({ ...editForm, park_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green/50 transition-all"
                  placeholder="เช่น อุทยานแห่งชาติเขาใหญ่"
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    วันที่เริ่มต้น <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    วันที่สิ้นสุด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    min={editForm.start_date || undefined}
                    className="w-full px-4 py-3 bg-white border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green/50 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  จำนวนวัน
                </label>
                <input
                  type="number"
                  value={editForm.duration_days}
                  readOnly
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground/60"
                />
              </div>

              {/* Location Coordinates */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  พิกัดที่ตั้งอุทยาน
                </label>
                <button
                  type="button"
                  onClick={handleGeocodeLocation}
                  className="w-full px-4 py-3 mb-3 bg-sky-blue/10 hover:bg-sky-blue/20 text-sky-blue border border-sky-blue/30 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  ค้นหาพิกัดอัตโนมัติ
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.000001"
                    value={editForm.location_lat || ''}
                    onChange={(e) => setEditForm({ ...editForm, location_lat: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-white border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green/50 transition-all"
                    placeholder="ละติจูด"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    value={editForm.location_lng || ''}
                    onChange={(e) => setEditForm({ ...editForm, location_lng: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-white border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green/50 transition-all"
                    placeholder="ลองจิจูด"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentEditStep(1);
                  }}
                  className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentEditStep(2)}
                  className="flex-1 px-6 py-3 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
                >
                  ถัดไป
                </button>
              </div>
                </div>
              )}

              {/* Step 2: Photos */}
              {currentEditStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">รูปภาพ</h3>
                    <p className="text-foreground/60 text-sm">เพิ่มหรือลบรูปภาพของทริป ({photos.length})</p>
                  </div>

              {/* Photo Management */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  รูปภาพ ({photos.length})
                </label>
                
                {/* Upload Button */}
                <div className="mb-3">
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-nature-green/10 hover:bg-nature-green/20 border-2 border-dashed border-nature-green/30 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-nature-green" />
                    <span className="text-nature-green font-semibold">
                      {uploadingPhotos ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhotos}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Photos Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getPhotoUrl(trip!.id, photo.id)}
                          alt={`Photo ${photo.id}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handlePhotoDelete(photo.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform scale-90 group-hover:scale-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentEditStep(1)}
                  className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors font-semibold"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentEditStep(3)}
                  className="flex-1 px-6 py-3 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
                >
                  ถัดไป
                </button>
              </div>
                </div>
              )}

              {/* Step 3: Trip Details */}
              {currentEditStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">รายละเอียดทริป</h3>
                    <p className="text-foreground/60 text-sm">บอกเล่าประสบการณ์ของคุณ</p>
                  </div>

              {/* Impression */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  ความประทับใจ
                </label>
                <textarea
                  value={editForm.impression}
                  onChange={(e) => setEditForm({ ...editForm, impression: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none"
                  placeholder="บรรยายประสบการณ์ สิ่งที่ประทับใจ บรรยากาศ..."
                />
              </div>

              {/* Places Visited */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  สถานที่ที่ไปในอุทยานนั้น
                </label>
                <div className="space-y-2">
                  {(editForm.places || []).map((place, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={place}
                        onChange={(e) => updatePlace(index, e.target.value)}
                        placeholder={`สถานที่ ${index + 1} เช่น น้ำตกเหวนรก`}
                        className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                      />
                      {(editForm.places || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlace(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPlace}
                    className="flex items-center gap-2 px-4 py-2 text-nature-green hover:bg-nature-green/5 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มสถานที่
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Tips สำหรับคนอื่น
                </label>
                <textarea
                  value={editForm.tips}
                  onChange={(e) => setEditForm({ ...editForm, tips: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none"
                  placeholder="เช่น ควรเตรียมอะไร เวลาไหนเหมาะสม สิ่งที่ควรระวัง..."
                />
              </div>

              {/* Expenses Table */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">
                  ค่าใช้จ่าย
                </label>
                <div className="border border-foreground/10 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-foreground/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/70">หมวดหมู่</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground/70">จำนวนเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {(editForm.expenses || []).map((expense, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-foreground/80">
                            {expense.category}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                              <input
                                type="number"
                                value={expense.amount}
                                onChange={(e) => {
                                  const newExpenses = [...(editForm.expenses || [])];
                                  newExpenses[index] = { ...expense, amount: e.target.value };
                                  setEditForm({ ...editForm, expenses: newExpenses });
                                }}
                                placeholder="0"
                                className="w-full pr-10 px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent text-right"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-nature-green/5 border-t-2 border-nature-green/20">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-foreground">รวมทั้งหมด</td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-nature-green">
                          {(editForm.expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0).toLocaleString()} ฿
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentEditStep(2)}
                  className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors font-semibold"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentEditStep(4)}
                  className="flex-1 px-6 py-3 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
                >
                  ถัดไป
                </button>
              </div>
                </div>
              )}

              {/* Step 4: Privacy Settings */}
              {currentEditStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">การแชร์</h3>
                    <p className="text-foreground/60 text-sm">เลือกว่าใครสามารถเห็นทริปนี้ได้บ้าง</p>
                  </div>

              {/* Privacy Level Cards */}
              <div className="space-y-3">
                {/* Private Option */}
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, privacy_level: 'private' })}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    editForm.privacy_level === 'private'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      editForm.privacy_level === 'private' ? 'bg-nature-green text-white' : 'bg-foreground/10 text-foreground/60'
                    }`}>
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1">🔒 ส่วนตัว</h3>
                      <p className="text-sm text-foreground/60">เฉพาะคุณเท่านั้นที่เห็นทริปนี้</p>
                    </div>
                    {editForm.privacy_level === 'private' && (
                      <Check className="w-6 h-6 text-nature-green" />
                    )}
                  </div>
                </button>

                {/* Friends Option */}
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, privacy_level: 'friends' })}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    editForm.privacy_level === 'friends'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      editForm.privacy_level === 'friends' ? 'bg-nature-green text-white' : 'bg-foreground/10 text-foreground/60'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1">👥 เพื่อน</h3>
                      <p className="text-sm text-foreground/60">เพื่อนของคุณสามารถเห็นทริปนี้ได้</p>
                    </div>
                    {editForm.privacy_level === 'friends' && (
                      <Check className="w-6 h-6 text-nature-green" />
                    )}
                  </div>
                </button>

                {/* Public Option */}
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, privacy_level: 'public' })}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    editForm.privacy_level === 'public'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      editForm.privacy_level === 'public' ? 'bg-nature-green text-white' : 'bg-foreground/10 text-foreground/60'
                    }`}>
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1">🌍 สาธารณะ</h3>
                      <p className="text-sm text-foreground/60">ทุกคนสามารถเห็นและค้นหาทริปนี้ได้</p>
                    </div>
                    {editForm.privacy_level === 'public' && (
                      <Check className="w-6 h-6 text-nature-green" />
                    )}
                  </div>
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentEditStep(3)}
                  className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors font-semibold"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
                </div>
              )}
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
