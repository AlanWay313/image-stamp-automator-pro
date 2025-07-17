
import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Star, Trash2, Check } from 'lucide-react';
import { Logo } from '@/pages/Index';

interface LogoManagerProps {
  logos: Logo[];
  onLogosUpdated: (logos: Logo[]) => void;
  selectedLogo: Logo | null;
  onLogoSelected: (logo: Logo | null) => void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({
  logos,
  onLogosUpdated,
  selectedLogo,
  onLogoSelected
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelection = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    const newLogos: Logo[] = imageFiles.map(file => ({
      id: `logo-${Date.now()}-${Math.random()}`,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      file,
      preview: URL.createObjectURL(file)
    }));

    onLogosUpdated([...logos, ...newLogos]);
  }, [logos, onLogosUpdated]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelection(e.dataTransfer.files);
  }, [handleFileSelection]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeLogo = (logoId: string) => {
    const logoToRemove = logos.find(logo => logo.id === logoId);
    if (logoToRemove) {
      URL.revokeObjectURL(logoToRemove.preview);
      if (selectedLogo?.id === logoId) {
        onLogoSelected(null);
      }
    }
    onLogosUpdated(logos.filter(logo => logo.id !== logoId));
  };

  const selectLogo = (logo: Logo) => {
    onLogoSelected(selectedLogo?.id === logo.id ? null : logo);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area for Logos */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-purple-500 bg-purple-50 scale-[1.02]'
            : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-colors ${
            isDragOver ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <Star className={`h-6 w-6 transition-colors ${
              isDragOver ? 'text-purple-600' : 'text-gray-600'
            }`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Adicionar Logos/Marcas d'Água
            </h3>
            <p className="text-gray-600 mb-4">
              Faça upload das suas logos em PNG ou JPEG
            </p>
          </div>

          <label className="cursor-pointer bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Selecionar Logo
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelection(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* Selected Logo Info */}
      {selectedLogo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Logo selecionada: {selectedLogo.name}
            </span>
          </div>
        </div>
      )}

      {/* Logos Grid */}
      {logos.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Suas Logos ({logos.length})</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {logos.map((logo) => (
              <div key={logo.id} className="relative group">
                <div 
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 ${
                    selectedLogo?.id === logo.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => selectLogo(logo)}
                >
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 relative">
                    <img
                      src={logo.preview}
                      alt={logo.name}
                      className="w-full h-full object-contain"
                    />
                    {selectedLogo?.id === logo.id && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate" title={logo.name}>
                    {logo.name}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLogo(logo.id);
                  }}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {logos.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma logo cadastrada ainda</p>
          <p className="text-sm text-gray-500">Faça upload de suas logos para começar</p>
        </div>
      )}
    </div>
  );
};
