import { useEffect, useRef } from "react";
import type { TourPlace } from "../api";

declare global {
  interface Window {
    naver: any;
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  history: "#6d4c41",
  food: "#e65100",
  nature: "#2e7d32",
  shopping: "#6a1b9a",
  culture: "#1565c0",
  entertainment: "#c62828",
};

interface Props {
  places: TourPlace[];
}

export default function NaverMap({ places }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) return;
    if (document.getElementById("naver-maps-script")) {
      if (window.naver) initMap();
      return;
    }

    const script = document.createElement("script");
    script.id = "naver-maps-script";
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initMap() {
    if (!mapRef.current || !window.naver) return;
    mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.9780),
      zoom: 12,
    });
    infoWindowRef.current = new window.naver.maps.InfoWindow({ anchorSkew: true });
    if (places.length > 0) renderMarkers(places);
  }

  useEffect(() => {
    if (!window.naver || !mapInstanceRef.current) return;
    renderMarkers(places);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  function renderMarkers(placeList: TourPlace[]) {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();
    if (placeList.length === 0) return;

    const bounds = new window.naver.maps.LatLngBounds();

    placeList.forEach((place) => {
      const position = new window.naver.maps.LatLng(place.lat, place.lng);
      const color = CATEGORY_COLORS[place.category] || "#555";

      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: {
          content: `<div style="background:${color};color:#fff;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;">${place.name.split("(")[0].trim()}</div>`,
          anchor: new window.naver.maps.Point(0, 0),
        },
      });

      const infoContent = `
        <div style="padding:12px;max-width:240px;font-family:'Segoe UI',sans-serif;">
          <strong style="font-size:14px;color:#1a1a1a;">${place.name}</strong>
          ${place.address ? `<p style="margin:4px 0;font-size:12px;color:#888;">${place.address}</p>` : ""}
          <p style="margin:6px 0;font-size:13px;color:#444;line-height:1.4;">${place.description}</p>
          <p style="margin:0;font-size:12px;color:#666;background:#f5f5f5;padding:6px 8px;border-radius:4px;"><strong>Tip:</strong> ${place.tips}</p>
        </div>`;

      window.naver.maps.Event.addListener(marker, "click", () => {
        infoWindowRef.current.setContent(infoContent);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
  }

  return <div ref={mapRef} style={{ width: "100%", height: "450px", borderRadius: "10px" }} />;
}
