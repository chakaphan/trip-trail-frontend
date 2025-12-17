'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TreePine, ArrowLeft, Clock, MapPin, Image as ImageIcon, X, Plus } from 'lucide-react';
import { createTimeline, uploadTimelinePhoto } from '@/app/services/memoryService';

export default function AddTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    time: '',
    title: '',
    description: '',
    locationName: '',
    locationLat: '',
    locationLng: '',
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setPhotoFiles([...photoFiles, ...files]);
      
      // Create preview URLs
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const memoryId = parseInt(resolvedParams.id);

      // Create timeline
      const timelineResponse = await createTimeline(memoryId, {
        time_label: formData.time,
        title: formData.title,
        description: formData.description,
        location_name: formData.locationName || undefined,
        location_lat: formData.locationLat ? parseFloat(formData.locationLat) : undefined,
        location_lng: formData.locationLng ? parseFloat(formData.locationLng) : undefined,
      });

      const timelineId = timelineResponse.timeline.id;

      // Upload photos if any
      if (photoFiles.length > 0) {
        await Promise.all(
          photoFiles.map((file, index) =>
            uploadTimelinePhoto(memoryId, timelineId, file, index)
          )
        );
      }

      // Navigate back to trip detail
      router.push(`/dashboard/trip/${resolvedParams.id}`);
    } catch (err) {
      console.error('Failed to create timeline:', err);
      setError('ไม่สามารถเพิ่ม Timeline ได้ กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue/5 to-white pb-20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-foreground/10 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/trip/${resolvedParams.id}`}
                className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-foreground/70" />
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2">
                <TreePine className="w-8 h-8 text-nature-green" />
                <h1 className="text-2xl font-bold text-nature-green hidden sm:block">MyNatureJourney</h1>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-foreground/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            เพิ่ม Timeline
          </h2>
          <p className="text-foreground/60 mb-8">
            เพิ่มช่วงเวลาและกิจกรรมในทริปของคุณ
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                เวลา / ช่วงเวลา *
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="เช่น Day 1 - เช้า, 09:00 - 12:00, วันแรก - บ่าย"
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                หัวข้อ *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น น้ำตกเหวนรก, เดินทางถึงอุทยาน"
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                รายละเอียด *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="เล่าประสบการณ์ในช่วงเวลานี้..."
                rows={5}
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                <ImageIcon className="inline w-4 h-4 mr-1" />
                รูปภาพ
              </label>

              {/* Upload Button */}
              <label className="block w-full cursor-pointer">
                <div className="border-2 border-dashed border-foreground/20 rounded-xl p-8 text-center hover:border-nature-green hover:bg-nature-green/5 transition-all">
                  <ImageIcon className="w-12 h-12 mx-auto text-foreground/40 mb-3" />
                  <p className="text-foreground/70 font-medium mb-1">
                    คลิกเพื่ออัปโหลดรูปภาพ
                  </p>
                  <p className="text-sm text-foreground/50">
                    รองรับไฟล์ JPG, PNG (สูงสุด 10 รูป)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </label>

              {/* Photo Preview Grid */}
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Link
                href={`/dashboard/trip/${resolvedParams.id}`}
                className="flex-1 px-6 py-3 border-2 border-foreground/20 text-foreground rounded-lg hover:bg-foreground/5 transition-colors font-semibold text-center"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-nature-green text-white rounded-lg hover:bg-nature-green/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    เพิ่ม Timeline
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
