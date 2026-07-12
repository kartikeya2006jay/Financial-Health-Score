import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SupplyChainMap.css';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const msmeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const supplierIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const buyerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function SupplyChainMap({ supplyChain, msmeName }) {
  // MSME Client is roughly in central India for visual purposes
  const msmeLocation = [21.1458, 79.0882]; // Nagpur coordinates

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={msmeLocation} 
        zoom={5} 
        scrollWheelZoom={false}
        className="supply-chain-map"
      >
        {/* Dark theme map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* MSME Node */}
        <Marker position={msmeLocation} icon={msmeIcon}>
          <Popup className="custom-popup">
            <strong>{msmeName || 'MSME Client'}</strong><br/>
            Central Hub
          </Popup>
        </Marker>

        {/* Suppliers and Buyers */}
        {supplyChain.map((node, i) => {
          const position = [node.lat, node.lng];
          const isSupplier = node.type === 'Supplier';
          
          return (
            <div key={i}>
              <Marker 
                position={position} 
                icon={isSupplier ? supplierIcon : buyerIcon}
              >
                <Popup className="custom-popup">
                  <strong>{node.name}</strong><br/>
                  {node.type}<br/>
                  Volume: ₹{(node.volume / 100000).toFixed(1)}L / mo
                </Popup>
              </Marker>
              
              {/* Draw animated line between MSME and the node */}
              <Polyline 
                positions={[msmeLocation, position]} 
                pathOptions={{ 
                  color: isSupplier ? '#f85149' : '#2ea043', 
                  weight: 2, 
                  opacity: 0.6,
                  dashArray: '5, 10',
                  className: isSupplier ? 'animated-line-in' : 'animated-line-out'
                }} 
              />
            </div>
          );
        })}
      </MapContainer>
      <div className="map-legend">
        <div className="legend-item"><span className="legend-dot" style={{background: '#ffd700'}}></span> MSME Hub</div>
        <div className="legend-item"><span className="legend-dot" style={{background: '#f85149'}}></span> Supplier (Inflow)</div>
        <div className="legend-item"><span className="legend-dot" style={{background: '#2ea043'}}></span> Buyer (Outflow)</div>
      </div>
    </div>
  );
}
