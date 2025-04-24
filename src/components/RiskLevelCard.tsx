
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getRiskColor, getRiskTranslation } from "@/hooks/useFireData";

interface RiskLevelCardProps {
  district: string;
  level: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';
}

const RiskLevelCard = ({ district, level }: RiskLevelCardProps) => {
  // Calculate progress value based on risk level
  const getRiskProgress = (level: string): number => {
    switch(level) {
      case 'low': return 20;
      case 'moderate': return 40;
      case 'high': return 60;
      case 'very-high': return 80;
      case 'extreme': return 100;
      default: return 0;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{district}</CardTitle>
        <CardDescription>Índice de Risco</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Nível</p>
          <p 
            className="text-sm font-bold"
            style={{ color: getRiskColor(level) }}
          >
            {getRiskTranslation(level)}
          </p>
        </div>
        <Progress 
          value={getRiskProgress(level)} 
          className="h-2" 
          indicatorClassName="bg-gradient-to-r" 
          style={{ 
            background: 'linear-gradient(to right, #64B6AC, #FFD166, #F39237, #EA526F, #D62828)',
            '--tw-gradient-to': getRiskColor(level)
          } as React.CSSProperties}
        />
      </CardContent>
    </Card>
  );
};

export default RiskLevelCard;
