
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { getRiskColor, getRiskTranslation } from '@/hooks/useFireData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const fireIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PORTUGAL_BOUNDS: L.LatLngBoundsExpression = [
  [36.8, -9.6],
  [42.2, -6.1]
];

const DEFAULT_CENTER: [number, number] = [39.5, -8.0];
const DEFAULT_ZOOM = 7;

interface FireMapProps {
  incidents: any[];
  riskLevels: any[];
}

const MapBounds = () => {
  const map = useMap();
  
  useEffect(() => {
    map.fitBounds(PORTUGAL_BOUNDS);
    map.setMaxBounds(PORTUGAL_BOUNDS);
  }, [map]);
  
  return null;
};

const FireMap = ({ incidents, riskLevels }: FireMapProps) => {
  const getDistrictRisk = (district: string) => {
    const risk = riskLevels.find(r => r.district === district);
    return risk ? risk.level : 'low';
  };

  const getDistrictCoordinates = (district: string): [number, number] => {
    const districtCoords: Record<string, [number, number]> = {
      'Aveiro': [40.6405, -8.6538],
      'Beja': [38.0153, -7.8632],
      'Braga': [41.5518, -8.4229],
      'Bragança': [41.8072, -6.7596],
      'Castelo Branco': [39.8230, -7.4931],
      'Coimbra': [40.2110, -8.4293],
      'Évora': [38.5707, -7.9095],
      'Faro': [37.0193, -7.9304],
      'Guarda': [40.5308, -7.2221],
      'Leiria': [39.7444, -8.8072],
      'Lisboa': [38.7223, -9.1393],
      'Portalegre': [39.2969, -7.4305],
      'Porto': [41.1579, -8.6291],
      'Santarém': [39.2369, -8.6853],
      'Setúbal': [38.5244, -8.8909],
      'Viana do Castelo': [41.6918, -8.8344],
      'Vila Real': [41.3058, -7.7449],
      'Viseu': [40.6566, -7.9125]
    };
    
    return districtCoords[district] || DEFAULT_CENTER;
  };

  return (
    <div className="h-[70vh] w-full rounded-md overflow-hidden shadow-md border">
      <MapContainer 
        className="h-full w-full"
        zoom={DEFAULT_ZOOM}
        minZoom={6}
        maxZoom={13}
        bounds={PORTUGAL_BOUNDS}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapBounds />
        
        {riskLevels.map((risk) => (
          <CircleMarker
            key={risk.district}
            center={getDistrictCoordinates(risk.district)}
            pathOptions={{
              fillColor: getRiskColor(risk.level),
              color: 'white',
              weight: 1,
              fillOpacity: 0.6,
              opacity: 0.8
            }}
            radius={15}
          >
            <Popup>
              <div className="font-medium">{risk.district}</div>
              <div className="text-sm">
                Temperatura: <span className="font-bold">
                  {risk.temperature !== undefined ? `${risk.temperature}°C` : '?°C'}
                </span>
              </div>
              <div className="text-sm">
                Risco: <span className="font-bold">{getRiskTranslation(risk.level)}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        
        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.lat, incident.lng]}
          >
            <Popup>
              <div className="font-bold">{incident.location}</div>
              <div>Distrito: {incident.district}</div>
              <div className="text-sm">
                Início: {new Date(incident.start).toLocaleString('pt-PT')}
              </div>
              <div className="text-sm">
                Estado: <span className={`font-bold ${incident.status === 'active' ? 'text-red-600' : incident.status === 'contained' ? 'text-orange-500' : 'text-green-600'}`}>
                  {incident.status === 'active' ? 'Ativo' : incident.status === 'contained' ? 'Contido' : 'Extinto'}
                </span>
              </div>
              <div className="text-sm">
                Meios: {incident.resources.men} operacionais, {incident.resources.terrain} terrestres, {incident.resources.aerial} aéreos
              </div>
              <div className="text-sm mt-1">
                Risco local: <span className="font-bold">{getRiskTranslation(getDistrictRisk(incident.district))}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default FireMap;
