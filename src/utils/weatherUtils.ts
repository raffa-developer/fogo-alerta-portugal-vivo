
export const windDirectionToText = (direction: string): string => {
  const directions: { [key: string]: string } = {
    'N': 'Norte',
    'NE': 'Nordeste',
    'E': 'Este',
    'SE': 'Sudeste',
    'S': 'Sul',
    'SW': 'Sudoeste',
    'W': 'Oeste',
    'NW': 'Noroeste'
  };
  
  return directions[direction] || direction;
};

export const getFireRiskFromWeather = (temperature: number, humidity: number, windSpeed: number): number => {
  // Basic fire risk calculation based on weather conditions
  const tempFactor = Math.max(0, (temperature - 15) / 25); // 0-1 scale
  const humidityFactor = (100 - humidity) / 100; // 0-1 scale
  const windFactor = Math.min(windSpeed, 50) / 50; // 0-1 scale
  
  // Weighted average of factors
  return (tempFactor * 0.4 + humidityFactor * 0.4 + windFactor * 0.2) * 100;
};

