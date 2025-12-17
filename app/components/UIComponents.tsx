'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className = '', hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-md border border-foreground/5 overflow-hidden
        ${hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''}
        ${gradient ? 'bg-gradient-to-br from-white to-foreground/5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface TimelineItemProps {
  time: string;
  title: string;
  description?: string;
  photos?: string[];
  location?: { name: string; lat: number; lng: number };
  isLast?: boolean;
}

export function TimelineItem({ time, title, description, photos, location, isLast = false }: TimelineItemProps) {
  return (
    <div className="flex gap-4 md:gap-6">
      {/* Timeline Indicator */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-nature-green to-sky-blue rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-nature-green via-sky-blue to-transparent mt-2 min-h-[60px]"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="bg-white rounded-2xl shadow-md border border-foreground/5 overflow-hidden hover:shadow-lg transition-shadow">
          {/* Header */}
          <div className="bg-gradient-to-r from-nature-green/10 to-sky-blue/10 px-4 md:px-6 py-3 md:py-4 border-b border-foreground/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-nature-green rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm font-semibold text-nature-green">{time}</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mt-2">{title}</h3>
          </div>

          {/* Body */}
          <div className="p-4 md:p-6">
            {description && (
              <p className="text-foreground/80 leading-relaxed mb-4">{description}</p>
            )}

            {/* Photos */}
            {photos && photos.length > 0 && (
              <div className={`grid gap-3 md:gap-4 mb-4 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {photos.map((photo, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <img src={photo} alt={`${title} ${idx + 1}`} className="w-full h-48 md:h-64 object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center gap-3 p-3 md:p-4 bg-foreground/5 rounded-lg">
                <svg className="w-5 h-5 text-nature-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-foreground">{location.name}</p>
                  <p className="text-xs text-foreground/60">📍 {location.lat}, {location.lng}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MasonryGridProps {
  photos: Array<{ url: string; caption?: string; tags?: string[] }>;
  columns?: { sm: number; md: number; lg: number };
}

export function MasonryGrid({ photos, columns = { sm: 2, md: 3, lg: 4 } }: MasonryGridProps) {
  return (
    <div className={`columns-${columns.sm} md:columns-${columns.md} lg:columns-${columns.lg} gap-3 md:gap-4`}>
      {photos.map((photo, idx) => (
        <div key={idx} className="break-inside-avoid mb-3 md:mb-4 group cursor-pointer">
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
            <img 
              src={photo.url} 
              alt={photo.caption || `Photo ${idx + 1}`}
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                {photo.caption && (
                  <p className="text-white font-medium text-sm md:text-base mb-2">{photo.caption}</p>
                )}
                {photo.tags && photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {photo.tags.map((tag, tagIdx) => (
                      <span 
                        key={tagIdx}
                        className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface BadgeProps {
  icon: string;
  name: string;
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  earned?: boolean;
  progress?: number;
  earnedDate?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ 
  icon, 
  name, 
  description, 
  rarity = 'common', 
  earned = false, 
  progress = 0,
  earnedDate,
  size = 'md'
}: BadgeProps) {
  const getRarityStyles = () => {
    const styles = {
      common: {
        bg: 'bg-foreground/10',
        border: 'border-foreground/20',
        text: 'text-foreground/70',
        glow: 'shadow-foreground/20'
      },
      rare: {
        bg: 'bg-sky-blue/20',
        border: 'border-sky-blue/40',
        text: 'text-sky-blue',
        glow: 'shadow-sky-blue/40'
      },
      epic: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/40',
        text: 'text-purple-600',
        glow: 'shadow-purple-500/40'
      },
      legendary: {
        bg: 'bg-gradient-to-br from-yellow-400/30 to-orange-500/30',
        border: 'border-yellow-500/50',
        text: 'text-orange-600',
        glow: 'shadow-yellow-500/60'
      }
    };
    return styles[rarity];
  };

  const sizeStyles = {
    sm: { container: 'w-16 h-16', icon: 'text-3xl', name: 'text-xs' },
    md: { container: 'w-20 h-20 md:w-24 md:h-24', icon: 'text-4xl md:text-5xl', name: 'text-sm md:text-base' },
    lg: { container: 'w-28 h-28 md:w-32 md:h-32', icon: 'text-5xl md:text-6xl', name: 'text-base md:text-lg' }
  };

  const styles = getRarityStyles();
  const sizes = sizeStyles[size];

  return (
    <div className="text-center group">
      {/* Badge Circle */}
      <div className={`
        ${sizes.container} rounded-full ${styles.bg} ${styles.border} border-2 
        flex items-center justify-center mx-auto mb-3
        ${earned ? `shadow-lg ${styles.glow} hover:scale-110` : 'grayscale opacity-60'}
        transition-all duration-300 relative
      `}>
        <span className={`${sizes.icon} ${!earned && 'opacity-40'}`}>{icon}</span>
        
        {/* Earned Badge */}
        {earned && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-nature-green rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Progress Ring for Locked Badges */}
        {!earned && progress > 0 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-nature-green/30"
              strokeDasharray={`${progress * 2.83} 283`}
            />
          </svg>
        )}
      </div>

      {/* Badge Name */}
      <h4 className={`${sizes.name} font-bold ${styles.text} mb-1 line-clamp-2`}>{name}</h4>
      
      {/* Description or Progress */}
      {earned && earnedDate ? (
        <p className="text-xs text-foreground/50">ได้รับ: {earnedDate}</p>
      ) : !earned && progress > 0 ? (
        <p className="text-xs text-foreground/60">{progress}%</p>
      ) : description ? (
        <p className="text-xs text-foreground/60 line-clamp-2">{description}</p>
      ) : null}
    </div>
  );
}

interface MapPopupProps {
  location: {
    name: string;
    emoji: string;
    province: string;
    image?: string;
    trips?: number;
    description?: string;
  };
  onClose: () => void;
  onViewDetails?: () => void;
}

export function MapPopup({ location, onClose, onViewDetails }: MapPopupProps) {
  return (
    <div className="w-64 md:w-80 bg-white rounded-2xl shadow-2xl border-2 border-foreground/10 overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Image Header */}
      {location.image && (
        <div className="relative h-32 md:h-40 overflow-hidden">
          <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Emoji Badge */}
          <div className="absolute bottom-3 left-3 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg">
            {location.emoji}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground mb-1">{location.name}</h3>
        <p className="text-sm text-foreground/60 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location.province}
        </p>

        {location.description && (
          <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{location.description}</p>
        )}

        {location.trips && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-nature-green/10 rounded-lg">
            <span className="text-2xl font-bold text-nature-green">{location.trips}</span>
            <span className="text-sm text-foreground/70">ทริปที่ไปแล้ว</span>
          </div>
        )}

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="w-full py-2.5 bg-gradient-to-r from-nature-green to-sky-blue text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
          >
            ดูรายละเอียด
          </button>
        )}
      </div>
    </div>
  );
}
