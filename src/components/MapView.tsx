"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Photo } from "@/lib/types";

const defaultIcon = L.icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapView({ photos }: { photos: Photo[] }) {
  const center: [number, number] =
    photos.length > 0
      ? [photos[0].latitude as number, photos[0].longitude as number]
      : [35.681236, 139.767125]; // 東京駅（写真がない場合のデフォルト）

  return (
    <MapContainer
      center={center}
      zoom={photos.length > 0 ? 5 : 4}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {photos.map((photo) => (
        <Marker
          key={photo.id}
          position={[photo.latitude as number, photo.longitude as number]}
          icon={defaultIcon}
        >
          <Popup>
            <Link href={`/photos/${photo.id}`} className="flex flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/files/${photo.thumbnailKey}`}
                alt={photo.caption ?? "旅の写真"}
                className="h-20 w-20 object-cover"
              />
              <span className="text-xs">{photo.caption ?? "写真を見る"}</span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
