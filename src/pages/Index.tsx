
import React, { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { LogoManager } from '@/components/LogoManager';
import { ImageProcessor } from '@/components/ImageProcessor';
import { Header } from '@/components/Header';
import { WatermarkPosition } from '@/types/watermark';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  processed?: string;
}

export interface Logo {
  id: string;
  name: string;
  file: File;
  preview: string;
}

const Index = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('bottom-right');
  const [activeTab, setActiveTab] = useState<'upload' | 'logos' | 'process'>('upload');

  const handleImagesUploaded = (newImages: UploadedImage[]) => {
    setUploadedImages(prev => [...prev, ...newImages]);
    if (newImages.length > 0 && activeTab === 'upload') {
      setActiveTab('process');
    }
  };

  const handleLogosUpdated = (newLogos: Logo[]) => {
    setLogos(newLogos);
  };

  const handleImageProcessed = (imageId: string, processedUrl: string) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, processed: processedUrl }
          : img
      )
    );
  };

  const clearAllImages = () => {
    setUploadedImages([]);
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md border">
              <div className="flex space-x-1">
                {[
                  { id: 'upload', label: 'Upload Imagens', icon: '📁' },
                  { id: 'logos', label: 'Gerenciar Logos', icon: '🎨' },
                  { id: 'process', label: 'Processar', icon: '⚡' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'upload' && (
              <ImageUploader 
                onImagesUploaded={handleImagesUploaded}
                uploadedImages={uploadedImages}
                onClearAll={clearAllImages}
              />
            )}

            {activeTab === 'logos' && (
              <LogoManager 
                logos={logos}
                onLogosUpdated={handleLogosUpdated}
                selectedLogo={selectedLogo}
                onLogoSelected={setSelectedLogo}
              />
            )}

            {activeTab === 'process' && (
              <ImageProcessor
                images={uploadedImages}
                selectedLogo={selectedLogo}
                watermarkPosition={watermarkPosition}
                onPositionChange={setWatermarkPosition}
                onImageProcessed={handleImageProcessed}
                onLogoSelect={() => setActiveTab('logos')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
