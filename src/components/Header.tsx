import React from "react";
import { Link } from "react-router-dom";
import { Flame, Map, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Flame className="h-6 w-6" />
            <span className="font-bold text-xl">Incendios.pt</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="hover:text-white/80 transition-colors flex items-center"
            >
              <Map className="h-4 w-4 mr-1" />
              Mapa
            </Link>
            <Link
              to="/prevention"
              className="flex items-center hover:text-white/80 transition-colors"
            >
              <Shield className="h-4 w-4 mr-1" />
              Prevenção
            </Link>
          </nav>

          <div className="flex items-center md:hidden">
            <button title="btnHeader" className="p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
