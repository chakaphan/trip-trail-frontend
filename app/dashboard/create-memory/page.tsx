'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TreePine, ArrowLeft, MapPin, Calendar, Upload, Image as ImageIcon, FileText, Share2, Lock, Users, Globe, Plus, X, Check, ChevronRight, Sparkles, DollarSign } from 'lucide-react';
import { createMemory, uploadPhoto } from '@/app/services/memoryService';

export default function CreateMemoryPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Location Info
  const [parkName, setParkName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState(1);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Step 2: Photos & Videos
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFilePreviews, setUploadedFilePreviews] = useState<string[]>([]);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate duration from start and end dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setDuration(diffDays);
      }
    }
  }, [startDate, endDate]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFilePreviews.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore errors on cleanup
        }
      });
    };
  }, [uploadedFilePreviews]);

  // Step 3: Trip Details
  const [impression, setImpression] = useState('');
  const [placesVisited, setPlacesVisited] = useState<string[]>(['']);
  const [tips, setTips] = useState('');
  const [expenses, setExpenses] = useState([
    { category: 'ค่าเข้าอุทยาน', amount: '' },
    { category: 'ที่พัก', amount: '' },
    { category: 'อาหาร', amount: '' },
    { category: 'เดินทาง', amount: '' },
  ]);

  // Step 4: Share Settings
  const [privacyLevel, setPrivacyLevel] = useState<'private' | 'friends' | 'public'>('friends');

  const steps = [
    { number: 1, title: 'ข้อมูลสถานที่', icon: MapPin },
    { number: 2, title: 'รูปภาพ & วิดีโอ', icon: ImageIcon },
    { number: 3, title: 'รายละเอียดทริป', icon: FileText },
    { number: 4, title: 'แชร์', icon: Share2 },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const previewUrls = fileArray.map(file => URL.createObjectURL(file));
      setUploadedFiles([...uploadedFiles, ...fileArray]);
      setUploadedFilePreviews([...uploadedFilePreviews, ...previewUrls]);
    }
  };

  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(uploadedFilePreviews[index]);
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    setUploadedFilePreviews(uploadedFilePreviews.filter((_, i) => i !== index));
  };

  const addPlace = () => {
    setPlacesVisited([...placesVisited, '']);
  };

  const updatePlace = (index: number, value: string) => {
    const updated = [...placesVisited];
    updated[index] = value;
    setPlacesVisited(updated);
  };

  const removePlace = (index: number) => {
    setPlacesVisited(placesVisited.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, amount: string) => {
    const updated = [...expenses];
    updated[index].amount = amount;
    setExpenses(updated);
  };

  // Geocode park name to get lat/lng
  const geocodeParkName = async (name: string) => {
    if (!name || name.trim().length < 3) return;
    
    try {
      setIsGeocoding(true);
      // Using Nominatim (OpenStreetMap) free geocoding API
      const query = encodeURIComponent(`${name}, Thailand`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=th`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          setLatitude(result.lat);
          setLongitude(result.lon);
        }
      }
    } catch (err) {
      // Geocoding error
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validation
      if (!parkName || !startDate || !endDate || duration < 1) {
        setError('กรุณากรอกข้อมูลสถานที่ให้ครบถ้วน');
        setCurrentStep(1);
        return;
      }

      // Prepare places data (filter out empty strings)
      const places = placesVisited.filter(place => place.trim() !== '');

      // Prepare expenses data (filter out empty amounts)
      const expensesData = expenses
        .filter(exp => exp.amount !== '')
        .map(exp => ({
          category: exp.category,
          amount: parseFloat(exp.amount)
        }));

      // Create memory
      const memoryResponse = await createMemory({
        park_name: parkName,
        start_date: startDate,
        end_date: endDate,
        duration_days: duration,
        location_lat: latitude ? parseFloat(latitude) : undefined,
        location_lng: longitude ? parseFloat(longitude) : undefined,
        impression: impression || undefined,
        tips: tips || undefined,
        privacy_level: privacyLevel,
        places: places.length > 0 ? places : undefined,
        expenses: expensesData.length > 0 ? expensesData : undefined,
      });

      if (!memoryResponse || !memoryResponse.memory) {
        throw new Error('Invalid response from server');
      }

      const memoryId = memoryResponse.memory.id;

      // Upload photos if any
      if (uploadedFiles.length > 0) {
        const uploadPromises = uploadedFiles.map((file, index) =>
          uploadPhoto(memoryId, file, index)
        );
        await Promise.all(uploadPromises);
      }

      // Success - redirect to trips page
      // Note: Don't revoke URLs here, let useEffect cleanup handle it
      router.push('/dashboard/trips');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error 
        : null;
      setError(errorMessage || 'เกิดข้อผิดพลาดในการบันทึกทริป กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-foreground/10 sticky top-0 z-20 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/dashboard" className="p-1.5 md:p-2 hover:bg-foreground/5 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground/70" />
              </Link>
              <div className="flex items-center gap-2">
                <TreePine className="w-7 h-7 md:w-8 md:h-8 text-nature-green" />
                <h1 className="text-lg md:text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
              </div>
            </div>
            <div className="text-xs md:text-sm text-foreground/60 font-medium">
              <span className="hidden sm:inline">ขั้นตอน </span>{currentStep}<span className="hidden sm:inline"> จาก </span><span className="sm:hidden">/</span>4
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Progress Steps */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 md:mb-2 transition-all ${
                      currentStep > step.number
                        ? 'bg-nature-green text-white'
                        : currentStep === step.number
                        ? 'bg-nature-green text-white ring-4 ring-nature-green/20'
                        : 'bg-foreground/10 text-foreground/40'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center hidden sm:block ${
                    currentStep >= step.number ? 'text-nature-green' : 'text-foreground/40'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                    currentStep > step.number ? 'bg-nature-green' : 'bg-foreground/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-foreground/5 p-8">
          {/* Step 1: Location Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">ข้อมูลสถานที่</h2>
                <p className="text-foreground/60">บอกเราว่าคุณไปที่ไหน</p>
              </div>

              {/* Park Name with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  ชื่ออุทยาน / สถานที่ท่องเที่ยว
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input
                      type="text"
                      value={parkName}
                      onChange={(e) => setParkName(e.target.value)}
                      placeholder="พิมพ์เพื่อค้นหา เช่น อุทยานแห่งชาติเขาใหญ่"
                      className="w-full pl-11 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => geocodeParkName(parkName)}
                    disabled={isGeocoding || !parkName}
                    className="px-4 py-3 bg-sky-blue text-white rounded-lg font-semibold hover:bg-sky-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {isGeocoding ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">ค้นหา...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5" />
                        <span className="hidden sm:inline">หาตำแหน่ง</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  💡 กดปุ่ม &ldquo;หาตำแหน่ง&rdquo; เพื่อค้นหาพิกัดและกรอกพิกัดอัตโนมัติ
                </p>
              </div>

              {/* Date Range */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    วันที่เริ่มต้น
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    วันที่สิ้นสุด
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  จำนวนวัน <span className="text-foreground/40 text-xs">(คำนวณอัตโนมัติ)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  readOnly
                  className="w-full px-4 py-3 border border-foreground/20 rounded-lg bg-foreground/5 text-foreground/60 cursor-not-allowed"
                  placeholder="เช่น 3"
                />
              </div>

              {/* Map Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    ละติจูด (Latitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    placeholder="เช่น 13.7563"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    ลองจิจูด (Longitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    placeholder="เช่น 100.5018"
                  />
                </div>
              </div>
              <p className="text-xs text-foreground/50 -mt-3">
                💡 กดปุ่ม &ldquo;หาตำแหน่ง&rdquo; เพื่อค้นหาพิกัดอัตโนมัติจากชื่อสถานที่ หรือกรอกเองได้
              </p>
            </div>
          )}

          {/* Step 2: Photos & Videos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">รูปภาพ & วิดีโอ</h2>
                <p className="text-foreground/60">เพิ่มภาพและวิดีโอจากทริปของคุณ</p>
              </div>

              {/* Upload Area - Mobile Optimized */}
              <div className="border-2 border-dashed border-foreground/20 rounded-2xl p-6 md:p-8 text-center hover:border-nature-green/50 transition-colors bg-gradient-to-br from-foreground/5 to-transparent active:scale-98">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-nature-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-nature-green" />
                  </div>
                  <p className="text-base md:text-lg font-semibold text-foreground/70 mb-2">
                    <span className="hidden md:inline">ลากไฟล์มาวางที่นี่ หรือ</span>แตะเพื่ออัปโหลด
                  </p>
                  <p className="text-sm text-foreground/50 mb-4">
                    รองรับ JPG, PNG, MP4
                  </p>
                  {/* Mobile Quick Actions */}
                  <div className="flex gap-3 justify-center md:hidden">
                    <button 
                      type="button"
                      className="flex-1 max-w-[140px] px-4 py-3 bg-sky-blue/10 text-sky-blue rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <ImageIcon className="w-5 h-5" />
                      แกลเลอรี
                    </button>
                    <button 
                      type="button"
                      className="flex-1 max-w-[140px] px-4 py-3 bg-nature-green/10 text-nature-green rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      ถ่ายภาพ
                    </button>
                  </div>
                </label>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-3">
                    ไฟล์ที่อัพโหลด ({uploadedFiles.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {uploadedFilePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-xl md:rounded-lg overflow-hidden bg-foreground/5 border-2 border-transparent group-active:border-nature-green transition-colors">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity active:scale-90"
                        >
                          <X className="w-5 h-5 md:w-4 md:h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs px-2 py-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity rounded-b-xl">
                          <span className="font-medium">Auto-tag: วิว</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Trip Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">รายละเอียดทริป</h2>
                <p className="text-foreground/60">บอกเล่าประสบการณ์ของคุณ</p>
              </div>

              {/* Impression */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  ความประทับใจ
                </label>
                <textarea
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  rows={5}
                  placeholder="บรรยายประสบการณ์ สิ่งที่ประทับใจ บรรยากาศ..."
                  className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none"
                />
              </div>

              {/* Places Visited in Park */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  สถานที่ที่ไปในอุทยานนั้น
                </label>
                <div className="space-y-2">
                  {placesVisited.map((place, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={place}
                        onChange={(e) => updatePlace(index, e.target.value)}
                        placeholder={`สถานที่ ${index + 1} เช่น น้ำตกเหวนรก`}
                        className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                      />
                      {placesVisited.length > 1 && (
                        <button
                          onClick={() => removePlace(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
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
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  rows={4}
                  placeholder="เช่น ควรเตรียมอะไร เวลาไหนเหมาะสม สิ่งที่ควรระวัง..."
                  className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none"
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
                      {expenses.map((expense, index) => (
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
                                onChange={(e) => updateExpense(index, e.target.value)}
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
                          {expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0).toLocaleString()} ฿
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Share Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">แชร์ทริปของคุณ</h2>
                <p className="text-foreground/60">เลือกว่าใครสามารถดูทริปนี้ได้บ้าง</p>
              </div>

              {/* Privacy Options */}
              <div className="space-y-3">
                {/* Private */}
                <button
                  onClick={() => setPrivacyLevel('private')}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    privacyLevel === 'private'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      privacyLevel === 'private' ? 'bg-nature-green text-white' : 'bg-foreground/10 text-foreground/40'
                    }`}>
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">🔒 Private</h3>
                      <p className="text-sm text-foreground/60">
                        เฉพาะคุณเท่านั้นที่เห็นทริปนี้ เก็บเป็นความลับส่วนตัว
                      </p>
                    </div>
                    {privacyLevel === 'private' && (
                      <Check className="w-6 h-6 text-nature-green flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Friends */}
                <button
                  onClick={() => setPrivacyLevel('friends')}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    privacyLevel === 'friends'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      privacyLevel === 'friends' ? 'bg-nature-green text-white' : 'bg-foreground/10 text-foreground/40'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">👥 Friends</h3>
                      <p className="text-sm text-foreground/60">
                        แชร์ให้เพื่อนๆ ของคุณดู เหมาะสำหรับการแชร์ประสบการณ์
                      </p>
                    </div>
                    {privacyLevel === 'friends' && (
                      <Check className="w-6 h-6 text-nature-green flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Public */}
                <button
                  onClick={() => setPrivacyLevel('public')}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    privacyLevel === 'public'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      privacyLevel === 'public' ? 'bg-nature-green text-white' : 'bg-foreground/10 text-foreground/40'
                    }`}>
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">🌍 Public</h3>
                      <p className="text-sm text-foreground/60">
                        ทุกคนสามารถดูได้ ช่วยแนะนำสถานที่ดีๆ ให้คนอื่น
                      </p>
                    </div>
                    {privacyLevel === 'public' && (
                      <Check className="w-6 h-6 text-nature-green flex-shrink-0" />
                    )}
                  </div>
                </button>
              </div>

              {/* Summary Preview */}
              <div className="bg-gradient-to-br from-nature-green/5 to-sky-blue/5 rounded-xl p-6 border border-foreground/10">
                <h4 className="font-bold text-foreground mb-4">สรุปทริปของคุณ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">สถานที่:</span>
                    <span className="font-medium">{parkName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">วันที่:</span>
                    <span className="font-medium">{startDate && endDate ? `${startDate} - ${endDate}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">จำนวนรูป:</span>
                    <span className="font-medium">{uploadedFiles.length} รูป</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">ค่าใช้จ่ายรวม:</span>
                    <span className="font-medium text-nature-green">
                      {expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0).toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">การแชร์:</span>
                    <span className="font-medium capitalize">{privacyLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-foreground/10">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 1 || isSubmitting
                  ? 'bg-foreground/5 text-foreground/30 cursor-not-allowed'
                  : 'bg-foreground/10 text-foreground hover:bg-foreground/20'
              }`}
            >
              ย้อนกลับ
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-nature-green text-white rounded-lg font-semibold hover:bg-nature-green/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-nature-green to-sky-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    บันทึกทริป
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
