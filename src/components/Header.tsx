
import { Flame } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <Flame className="h-6 w-6 text-fire" />
          <h1 className="text-xl font-bold">Fogo Alerta Portugal</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">
            Mapa
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">
            Estatísticas
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">
            Prevenção
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">
            Sobre
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
