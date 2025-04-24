
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FireIncident {
  id: string;
  district: string;
  location: string;
  start: string;
  status: 'active' | 'contained' | 'extinguished';
  resources: {
    men: number;
    terrain: number;
    aerial: number;
  };
}

interface ActiveFiresListProps {
  incidents: FireIncident[];
}

const ActiveFiresList = ({ incidents }: ActiveFiresListProps) => {
  // Sort incidents by status (active first) and then by start time (newest first)
  const sortedIncidents = [...incidents].sort((a, b) => {
    // First by status
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    
    // Then by start time
    return new Date(b.start).getTime() - new Date(a.start).getTime();
  });
  
  // Only show up to 5 incidents in the list
  const displayIncidents = sortedIncidents.slice(0, 5);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-fire" />
          <CardTitle className="text-lg">Incêndios Ativos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {displayIncidents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Não há incêndios ativos neste momento
          </div>
        ) : (
          <ul className="divide-y">
            {displayIncidents.map((incident) => (
              <li key={incident.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{incident.location}</span>
                  <Badge variant={
                    incident.status === 'active' 
                      ? 'destructive' 
                      : incident.status === 'contained' 
                        ? 'default' 
                        : 'outline'
                  }>
                    {incident.status === 'active' 
                      ? 'Ativo' 
                      : incident.status === 'contained' 
                        ? 'Contido' 
                        : 'Extinto'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{incident.district}</span>
                  <span>
                    {new Date(incident.start).toLocaleDateString('pt-PT')} 
                    {' '}
                    {new Date(incident.start).toLocaleTimeString('pt-PT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-muted-foreground">Meios: </span>
                  <span className="font-medium">{incident.resources.men} operacionais</span>
                  {incident.resources.aerial > 0 && (
                    <span className="ml-2 font-medium">{incident.resources.aerial} meios aéreos</span>
                  )}
                </div>
              </li>
            ))}
            {sortedIncidents.length > 5 && (
              <li className="p-2 text-center">
                <a href="#" className="text-sm text-primary hover:underline">
                  Ver mais {sortedIncidents.length - 5} incêndios
                </a>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveFiresList;
