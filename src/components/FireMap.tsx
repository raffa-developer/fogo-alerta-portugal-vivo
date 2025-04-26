import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import { getRiskColor, getRiskTranslation } from "@/hooks/useFireData";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const fireIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/785/785116.png", // Ícone de fogo
  iconRetinaUrl: "https://cdn-icons-png.flaticon.com/512/785/785116.png", // Ícone de fogo (2x)
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER: [number, number] = [39.5, -8.0];
const DEFAULT_ZOOM = 7;

// Define proper TypeScript interfaces
interface Resources {
  men: number;
  terrain: number;
  aerial: number;
}

interface FireIncident {
  id: string;
  location: string;
  district: string;
  lat: number;
  lng: number;
  start: string;
  status: "active" | "contained" | "extinguished";
  resources: Resources;
}

interface RiskLevel {
  district: string;
  level: "low" | "moderate" | "high" | "very-high" | "extreme";
  temperature?: number;
}

interface FireMapProps {
  incidents: FireIncident[];
  riskLevels: RiskLevel[];
}

const MapBounds = () => {
  const map = useMap();

  useEffect(() => {
    // Apenas ajusta a visualização inicial, sem restringir o movimento
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  }, [map]);

  return null;
};

const FireMap = ({ incidents, riskLevels }: FireMapProps) => {
  const getDistrictRisk = (
    district: string
  ): "low" | "moderate" | "high" | "very-high" | "extreme" => {
    const risk = riskLevels.find((r) => r.district === district);
    if (!risk) {
      console.warn(`Distrito não encontrado: ${district}`);
      return "low";
    }
    return risk.level;
  };

  const getDistrictCoordinates = (district: string): [number, number] => {
    const districtCoords: Record<string, [number, number]> = {
      Aveiro: [40.6405, -8.6538],
      Beja: [38.0153, -7.8632],
      Braga: [41.5518, -8.4229],
      Bragança: [41.8072, -6.7596],
      "Castelo Branco": [39.823, -7.4931],
      Coimbra: [40.211, -8.4293],
      Évora: [38.5707, -7.9095],
      Faro: [37.0193, -7.9304],
      Guarda: [40.5308, -7.2221],
      Leiria: [39.7444, -8.8072],
      Lisboa: [38.7223, -9.1393],
      Portalegre: [39.2969, -7.4305],
      Porto: [41.1579, -8.6291],
      Santarém: [39.2369, -8.6853],
      Setúbal: [38.5244, -8.8909],
      "Viana do Castelo": [41.6918, -8.8344],
      "Vila Real": [41.3058, -7.7449],
      Viseu: [40.6566, -7.9125],
    };

    const coords = districtCoords[district];
    if (!coords) {
      console.warn(`Coordenadas não encontradas para o distrito: ${district}`);
      return DEFAULT_CENTER;
    }
    return coords;
  };

  return (
    <div className="h-[70vh] w-full rounded-md overflow-hidden shadow-md border">
      <MapContainer
        className="h-full w-full"
        //center={DEFAULT_CENTER}
        //zoom={DEFAULT_ZOOM}
        //minZoom={3} // Permite zoom out para ver o mundo todo
        //maxZoom={18} // Aumenta o zoom máximo para mais detalhes
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapBounds />

        {riskLevels.map((risk) => (
          <CircleMarker
            key={risk.district}
            center={getDistrictCoordinates(risk.district)}
            pathOptions={{
              fillColor: getRiskColor(risk.level),
              color: "white",
              weight: 1,
              fillOpacity: 0.6,
              opacity: 0.8,
              radius: 15,
            }}
          >
            <Popup>
              <div className="font-medium">{risk.district}</div>
              <div className="text-sm">
                Temperatura:{" "}
                <span className="font-bold">
                  {risk.temperature !== undefined
                    ? `${risk.temperature}°C`
                    : "?°C"}
                </span>
              </div>
              <div className="text-sm">
                Risco:{" "}
                <span className="font-bold">
                  {getRiskTranslation(risk.level)}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.lat, incident.lng]}
            icon={fireIcon as L.Icon}
          >
            <Popup>
              <div className="font-bold">{incident.location}</div>
              <div>Distrito: {incident.district}</div>
              <div className="text-sm">
                Início: {new Date(incident.start).toLocaleString("pt-PT")}
              </div>
              <div className="text-sm">
                Estado:{" "}
                <span
                  className={`font-bold ${
                    incident.status === "active"
                      ? "text-red-600"
                      : incident.status === "contained"
                      ? "text-orange-500"
                      : "text-green-600"
                  }`}
                >
                  {incident.status === "active"
                    ? "Ativo"
                    : incident.status === "contained"
                    ? "Contido"
                    : "Extinto"}
                </span>
              </div>
              <div className="text-sm">
                Meios: {incident.resources.men} operacionais,{" "}
                {incident.resources.terrain} terrestres,{" "}
                {incident.resources.aerial} aéreos
              </div>
              <div className="text-sm mt-1">
                Risco local:{" "}
                <span className="font-bold">
                  {getRiskTranslation(getDistrictRisk(incident.district))}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default FireMap;
