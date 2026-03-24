"use client";

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; 

interface ListingMapProps {
  longitude: number;
  latitude: number;
  title?: string; // We added title so we can show it in the popup bubble!
}

export default function ListingMap({ longitude, latitude, title }: ListingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    if (mapContainerRef.current) {
      // 1. Create the Map
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12', 
        center: [longitude, latitude], 
        zoom: 14, 
      });

      // 2. ADD NAVIGATION CONTROLS (+/- Zoom and Compass)
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // 3. ADD FULLSCREEN CONTROL
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // 4. Create the Popup Bubble (Like the "MNR Groom Sherwani" screenshot)
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`<h3 style="font-weight:bold; font-family:sans-serif; font-size:14px; margin:0;">${title || "Listing Location"}</h3>`);

      // 5. Create the Red Marker and attach the Popup
      new mapboxgl.Marker({ color: "#ff563f" })
        .setLngLat([longitude, latitude])
        .setPopup(popup) // Attach the bubble to the pin
        .addTo(map)
        .togglePopup(); // Force the bubble to be open by default!

      return () => map.remove();
    }
  }, [longitude, latitude, title]);

  return (
    // Gave it slightly rounded corners like your screenshot
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-200">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}