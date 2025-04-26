import { useEffect } from "react";
import { toast } from "sonner";
import { Flame } from "lucide-react";

import Header from "@/components/Header";
import FireMap from "@/components/FireMap";
import RiskLevelCard from "@/components/RiskLevelCard";
import ActiveFiresList from "@/components/ActiveFiresList";
import WeatherInfo from "@/components/WeatherInfo";

import { useFireData } from "@/hooks/useFireData";
import { useWeatherData } from "@/hooks/useWeatherData";

interface RiskLevel {
  district: string;
  level: "low" | "moderate" | "high" | "very-high" | "extreme";
  temperature?: number;
}

const Index = () => {
  const {
    data: fireData,
    isLoading: isLoadingFireData,
    isError: isFireError,
  } = useFireData();
  const {
    data: weatherData,
    isLoading: isLoadingWeather,
    isError: isWeatherError,
  } = useWeatherData();

  // Show toast when data is loaded for the first time
  useEffect(() => {
    if (fireData && !isLoadingFireData) {
      if (fireData.incidents.length > 0) {
        toast.info(`${fireData.incidents.length} incêndios em Portugal`, {
          icon: <Flame className="h-4 w-4 text-fire" />,
        });
      } else {
        toast.success(
          "Não existem incêndios ativos em Portugal neste momento",
          {
            icon: <Flame className="h-4 w-4 text-green-500" />,
          }
        );
      }
    }
  }, [fireData, isLoadingFireData]);

  // Show error toasts on API failures
  useEffect(() => {
    if (isFireError) {
      toast.error(
        "Erro ao carregar dados de incêndios. Tente novamente mais tarde."
      );
    }
    if (isWeatherError) {
      toast.error(
        "Erro ao carregar dados meteorológicos. Tente novamente mais tarde."
      );
    }
  }, [isFireError, isWeatherError]);

  // Get top risk districts (for highlighting)
  const getHighRiskDistricts = (): RiskLevel[] => {
    if (!fireData?.riskLevels) return [];

    return fireData.riskLevels
      .filter((risk) => ["very-high", "extreme"].includes(risk.level))
      .slice(0, 3);
  };

  const renderTimestamp = () => {
    if (!fireData?.timestamp) return "Carregando...";

    try {
      return new Date(fireData.timestamp).toLocaleString("pt-PT");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <h2 className="text-2xl font-bold mb-6">
            Monitorização de Incêndios em Portugal
          </h2>

          {/* Primary content - Map */}
          <div className="mb-6">
            <FireMap
              incidents={fireData?.incidents || []}
              riskLevels={fireData?.riskLevels || []}
            />
          </div>

          {/* Secondary content - Grid with cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Left column - Active fires */}
            <div className="md:col-span-2">
              <ActiveFiresList incidents={fireData?.incidents || []} />
            </div>

            {/* Right column - Weather and risk info */}
            <div className="space-y-4">
              <WeatherInfo
                conditions={weatherData}
                isLoading={isLoadingWeather}
              />

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  Distritos de Alto Risco
                </h3>
                {getHighRiskDistricts().map((risk) => (
                  <RiskLevelCard
                    key={risk.district}
                    district={risk.district}
                    level={risk.level}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Dados atualizados em: {renderTimestamp()}</p>
            <p className="mt-1">
              Fonte: Dados obtidos através de APIs públicas da Autoridade
              Nacional de Emergência e Proteção Civil
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
