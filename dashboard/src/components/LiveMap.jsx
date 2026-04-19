import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom red icon for emergency
const emergencyIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function LiveMap({ locationData }) {
  // Default to a generic location if no signal yet
  const position = locationData ? [locationData.lat, locationData.lng] : [28.6139, 77.2090]; 

  return (
    <div className="relative border border-gray-600 rounded-lg overflow-hidden">
      <MapContainer center={position} zoom={15} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locationData && (
          <>
            <Marker position={position} icon={emergencyIcon}>
              <Popup>
                Distress Signal Origin.<br/> Lat: {locationData.lat.toFixed(4)}, Lng: {locationData.lng.toFixed(4)}
              </Popup>
            </Marker>
            <MapRecenter position={position} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
