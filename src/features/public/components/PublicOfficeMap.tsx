import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { publicContact } from "../public.content";

export default function PublicOfficeMap() {
  return (
    <div className="relative z-0 h-[360px] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100" aria-label="Map showing MIPRO office area in Uttara, Dhaka">
      <MapContainer className="h-full w-full" center={publicContact.mapCenter} zoom={15} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={publicContact.mapCenter} radius={10} pathOptions={{ color: "#ffffff", fillColor: "#0e7490", fillOpacity: 1, weight: 3 }}>
          <Popup><strong>MIPRO Healthcare Corporation</strong><br />Uttara, Dhaka</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
