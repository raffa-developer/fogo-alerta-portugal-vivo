
import React from 'react';
import Header from "@/components/Header";
import { AlertTriangle, Book, Calendar, FireExtinguisher, Shield, ThermometerSun } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getFireRiskFromWeather } from "@/utils/weatherUtils";
import { useWeatherData } from "@/hooks/useWeatherData";

const Prevention = () => {
  const { data: weatherData } = useWeatherData();
  
  // Get the average risk from weather data
  const getAverageRisk = () => {
    if (!weatherData || weatherData.length === 0) return 0;
    
    const totalRisk = weatherData.reduce((sum, location) => {
      return sum + getFireRiskFromWeather(
        location.temperature,
        location.humidity,
        location.windSpeed
      );
    }, 0);
    
    return totalRisk / weatherData.length;
  };
  
  // Get risk level text based on percentage
  const getRiskLevelText = (risk: number) => {
    if (risk < 20) return "Baixo";
    if (risk < 40) return "Moderado";
    if (risk < 60) return "Alto";
    if (risk < 80) return "Muito Alto";
    return "Extremo";
  };
  
  // Get color for risk level
  const getRiskColor = (risk: number) => {
    if (risk < 20) return "bg-green-500";
    if (risk < 40) return "bg-yellow-500";
    if (risk < 60) return "bg-orange-500";
    if (risk < 80) return "bg-red-500";
    return "bg-red-700";
  };
  
  const averageRisk = getAverageRisk();
  const riskLevel = getRiskLevelText(averageRisk);
  const riskColor = getRiskColor(averageRisk);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-2xl font-bold">Prevenção de Incêndios</h2>
          </div>
          
          {/* Risk Meter */}
          <div className="mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <ThermometerSun className="mr-2 h-5 w-5 text-amber-500" />
                  Risco Atual de Incêndio
                </CardTitle>
                <CardDescription>
                  Baseado nas condições meteorológicas atuais em todo o país
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full ${riskColor} transition-all`} 
                      style={{ width: `${Math.min(100, averageRisk)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between w-full text-xs text-gray-600">
                    <span>Baixo</span>
                    <span>Moderado</span>
                    <span>Alto</span>
                    <span>Muito Alto</span>
                    <span>Extremo</span>
                  </div>
                  <div className="text-2xl font-bold mt-4">{riskLevel}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Medidas de Prevenção Importantes</h3>
          
          {/* Prevention Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                  Em Florestas e Matas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Não fazer fogueiras entre junho e setembro</li>
                  <li>Não deitar fósforos ou cigarros acesos ao chão</li>
                  <li>Não queimar mato cortado sem autorização</li>
                  <li>Limpe o mato à volta da sua habitação</li>
                  <li>Mantenha uma faixa de proteção à volta da sua casa</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FireExtinguisher className="mr-2 h-5 w-5 text-red-500" />
                  Em Caso de Incêndio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Ligue imediatamente para o 112</li>
                  <li>Indique o local exato e a extensão do incêndio</li>
                  <li>Afaste-se do incêndio em direção contrária ao vento</li>
                  <li>Colabore com as autoridades sempre que solicitado</li>
                  <li>Proteja a boca e o nariz com um pano húmido</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Legal Information and Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="mr-2 h-5 w-5 text-blue-500" />
                  Legislação em Vigor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700">
                  O Decreto-Lei n.º 124/2006, de 28 de junho, estabelece as medidas e ações a desenvolver no âmbito do Sistema Nacional de Defesa da Floresta Contra Incêndios.
                </p>
                <p className="text-gray-700">
                  Para proprietários, incluindo medidas de limpeza de terrenos e a obrigatoriedade de manter uma faixa de proteção de 50 metros à volta das habitações em zonas rurais.
                </p>
              </CardContent>
              <CardFooter>
                <a href="https://www.portugal.gov.pt/pt/gc21/area-de-governo/administracao-interna/informacao-adicional/legislacao-de-protecao-civil.aspx" 
                   className="text-primary hover:underline" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  Consultar legislação completa →
                </a>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-green-500" />
                  Período Crítico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700">
                  O período crítico no âmbito do Sistema Nacional de Defesa da Floresta Contra Incêndios vigora de 1 de julho a 30 de setembro.
                </p>
                <p className="text-gray-700">
                  Neste período, as medidas preventivas são reforçadas e existem restrições adicionais, incluindo a proibição total de fazer fogo ou realizar queimadas.
                </p>
              </CardContent>
              <CardFooter>
                <a href="https://www.prociv.pt/pt-pt/RISCOSPREV/RISCOSNAT/INCENDIOSRURAIS/Paginas/default.aspx" 
                   className="text-primary hover:underline" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  Mais informações sobre o período crítico →
                </a>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>A prevenção começa com cada um de nós. Se vir um incêndio ou comportamento de risco, ligue 112 imediatamente.</p>
            <p className="mt-1">Fonte: Informações baseadas em diretrizes da Autoridade Nacional de Proteção Civil</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Prevention;
