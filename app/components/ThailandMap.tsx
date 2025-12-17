'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  name: string;
  lat: number;
  lng: number;
  province: string;
}

interface ThailandMapProps {
  visitedLocations: Location[];
  bucketList: Location[];
  height?: string;
}

export default function ThailandMap({ visitedLocations, bucketList, height = '500px' }: ThailandMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map centered on Thailand
    const map = L.map(containerRef.current).setView([13.7563, 100.5018], 6);

    // Add OpenStreetMap tiles (free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom icon for visited locations (green)
    const greenIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #4CAF50; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #2E7D32; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">✓</div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    // Custom icon for bucket list (blue)
    const blueIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #4FC3F7; width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #0277BD; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">★</div></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20],
    });

    // Add visited location markers
    visitedLocations.forEach((location) => {
      L.marker([location.lat, location.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; font-family: 'Prompt', sans-serif;">
            <strong style="color: #4CAF50; font-size: 14px;">${location.name}</strong><br/>
            <span style="font-size: 12px; color: #666;">${location.province}</span><br/>
            <span style="font-size: 11px; color: #999;">✓ เคยไปแล้ว</span>
          </div>
        `);
    });

    // Add bucket list markers
    bucketList.forEach((location) => {
      L.marker([location.lat, location.lng], { icon: blueIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; font-family: 'Prompt', sans-serif;">
            <strong style="color: #4FC3F7; font-size: 14px;">${location.name}</strong><br/>
            <span style="font-size: 12px; color: #666;">${location.province}</span><br/>
            <span style="font-size: 11px; color: #999;">★ อยากไป</span>
          </div>
        `);
    });

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [visitedLocations, bucketList]);

  return (
    <div className="relative rounded-xl overflow-hidden [&_.leaflet-pane]:!z-[1] [&_.leaflet-control]:!z-[2]" style={{ height }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 z-10">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-nature-green rounded-full"></div>
            <span className="text-foreground/70 font-medium">เคยไปแล้ว ({visitedLocations.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-sky-blue rounded-full"></div>
            <span className="text-foreground/70 font-medium">อยากไป ({bucketList.length})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
