import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";

interface FireIncident {
  id: string;
  district: string;
  location: string;
  start: string;
  status: "active" | "contained" | "extinguished";
  resources: {
    men: number;
    terrain: number;
    aerial: number;
  };
}

interface ActiveFiresListProps {
  incidents: FireIncident[];
}

type IncidentStatus = "active" | "contained" | "extinguished";

const ActiveFiresList = ({ incidents }: ActiveFiresListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<FireIncident | null>(
    null
  );
  const [showPopup, setShowPopup] = useState(false);

  // Sort incidents by status (active first) and then by start time (newest first)
  const sortedIncidents = [...incidents].sort((a, b) => {
    // First by status
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;

    // Then by start time
    return new Date(b.start).getTime() - new Date(a.start).getTime();
  });

  // Show all incidents if showAll is true, otherwise show only 5
  const displayIncidents = showAll
    ? sortedIncidents
    : sortedIncidents.slice(0, 5);

  // Function to translate status to Portuguese
  const translateStatus = (status: IncidentStatus): string => {
    switch (status) {
      case "active":
        return "Ativo";
      case "contained":
        return "Contido";
      case "extinguished":
        return "Extinto";
      default:
        return status;
    }
  };

  // Handle clicking on an incident - always show the popup
  const handleIncidentClick = (incident: FireIncident) => {
    setSelectedIncident(incident);
    setShowPopup(true);
  };

  // Close the popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedIncident(null);
  };

  // Calculate duration from start time to now
  const calculateDuration = (startTimeStr: string): string => {
    const startTime = new Date(startTimeStr);
    const now = new Date();

    if (isNaN(startTime.getTime())) {
      return "Data inválida";
    }

    const diffMs = now.getTime() - startTime.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Prevent body scrolling when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup]);

  const renderIncidentList = () => {
    if (sortedIncidents.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          Não há incêndios ativos neste momento
        </div>
      );
    }

    return (
      <ul className="divide-y">
        {displayIncidents.map((incident) => {
          const startDate = new Date(incident.start);
          const isValidDate = !isNaN(startDate.getTime());

          return (
            <li
              key={incident.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleIncidentClick(incident)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{incident.location}</span>
                <Badge
                  variant={
                    incident.status === "active"
                      ? "destructive"
                      : incident.status === "contained"
                      ? "default"
                      : "outline"
                  }
                >
                  {translateStatus(incident.status)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{incident.district}</span>
                <span>
                  {isValidDate
                    ? format(startDate, "dd/MM/yyyy HH:mm", { locale: pt })
                    : "Data inválida"}
                </span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-muted-foreground">Meios: </span>
                <span className="font-medium">
                  {incident.resources.men} operacionais
                </span>
                {incident.resources.aerial > 0 && (
                  <span className="ml-2 font-medium">
                    {incident.resources.aerial} meios aéreos
                  </span>
                )}
              </div>
            </li>
          );
        })}
        {!showAll && sortedIncidents.length > 5 && (
          <li className="p-2 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Ver mais {sortedIncidents.length - 5} incêndios
            </button>
          </li>
        )}
        {showAll && sortedIncidents.length > 5 && (
          <li className="p-2 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(false);
              }}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Mostrar menos
            </button>
          </li>
        )}
      </ul>
    );
  };

  const renderPopup = () => {
    if (!showPopup || !selectedIncident) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
        onClick={closePopup}
      >
        <div
          className="bg-background rounded-t-lg sm:rounded-lg shadow-lg max-w-md w-full mx-4 sm:mb-0 mb-0"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside popup
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {selectedIncident.location}
            </h3>
            <button
              title="btnPopup"
              onClick={closePopup}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Distrito</p>
                <p className="font-medium">{selectedIncident.district}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium">
                  {translateStatus(selectedIncident.status)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p className="font-medium">
                  {format(
                    new Date(selectedIncident.start),
                    "dd/MM/yyyy HH:mm",
                    { locale: pt }
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">
                  {calculateDuration(selectedIncident.start)}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Recursos</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted rounded p-3 text-center">
                  <p className="text-2xl font-bold">
                    {selectedIncident.resources.men}
                  </p>
                  <p className="text-xs text-muted-foreground">Operacionais</p>
                </div>
                <div className="bg-muted rounded p-3 text-center">
                  <p className="text-2xl font-bold">
                    {selectedIncident.resources.terrain}
                  </p>
                  <p className="text-xs text-muted-foreground">Terrestres</p>
                </div>
                <div className="bg-muted rounded p-3 text-center">
                  <p className="text-2xl font-bold">
                    {selectedIncident.resources.aerial}
                  </p>
                  <p className="text-xs text-muted-foreground">Aéreos</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={closePopup}
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-fire" />
          <CardTitle className="text-lg">Incêndios Ativos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">{renderIncidentList()}</CardContent>
      {renderPopup()}
    </Card>
  );
};

export default ActiveFiresList;
