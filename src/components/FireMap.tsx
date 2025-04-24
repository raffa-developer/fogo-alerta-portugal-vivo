
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { getRiskColor, getRiskTranslation } from '@/hooks/useFireData';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngExpression } from 'leaflet';

// Define custom marker icon to fix the missing icon issue
const fireIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Center the map on Portugal
const DEFAULT_CENTER: LatLngExpression = [39.5, -8.0];
const DEFAULT_ZOOM = 7;

interface FireMapProps {
  incidents: any[];
  riskLevels: any[];
}

// Component to recenter map when props change
const MapUpdater = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const FireMap = ({ incidents, riskLevels }: FireMapProps) => {
  // Match incidents with district risk levels
  const getDistrictRisk = (district: string) => {
    const risk = riskLevels.find(r => r.district === district);
    return risk ? risk.level : 'low';
  };

  // Get district center coordinates for risk circles
  const getDistrictCoordinates = (district: string): LatLngExpression => {
    // This would ideally come from a GeoJSON file or API
    // For now using approximate coordinates for demonstration
    const districtCoords: Record<string, LatLngExpression> = {
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
        className="h-full"
        zoom={DEFAULT_ZOOM}
        center={DEFAULT_CENTER}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* District risk level visualization */}
        {riskLevels.map((risk) => (
          <Circle
            key={risk.district}
            center={getDistrictCoordinates(risk.district)}
            pathOptions={{
              fillColor: getRiskColor(risk.level),
              color: getRiskColor(risk.level),
              fillOpacity: 0.3
            }}
          >
            <Popup>
              <div className="font-medium">{risk.district}</div>
              <div className="text-sm">
                Risco: <span className="font-bold">{getRiskTranslation(risk.level)}</span>
              </div>
            </Popup>
          </Circle>
        ))}
        
        {/* Active fire incidents */}
        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.lat, incident.lng] as LatLngExpression}
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
        
        <MapUpdater center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} />
      </MapContainer>
    </div>
  );
};

export default FireMap;
