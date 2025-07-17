
import React from 'react';
import { Droplets, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Droplets className="h-8 w-8 text-blue-600" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WaterMark Pro</h1>
              <p className="text-sm text-gray-600">Automação de marca d'água para imagens</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Sistema Ativo</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
