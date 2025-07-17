
import React from 'react';
import { Download, Package, FileImage } from 'lucide-react';
import { UploadedImage } from '@/pages/Index';
import { downloadAsZip, downloadSingleImage } from '@/utils/downloadHelper';

interface DownloadManagerProps {
  images: UploadedImage[];
}

export const DownloadManager: React.FC<DownloadManagerProps> = ({ images }) => {
  const processedImages = images.filter(img => img.processed);

  const handleDownloadAll = async () => {
    await downloadAsZip(processedImages);
  };

  const handleDownloadSingle = (image: UploadedImage) => {
    if (image.processed) {
      downloadSingleImage(image.processed, image.file.name);
    }
  };

  if (processedImages.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Download className="h-5 w-5" />
        <span>Download das Imagens</span>
      </h3>

      {/* Download All Button */}
      <div className="mb-6">
        <button
          onClick={handleDownloadAll}
          className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Package className="h-5 w-5" />
          <span>Baixar Todas ({processedImages.length} imagens)</span>
        </button>
      </div>

      {/* Individual Downloads */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Downloads Individuais</h4>
        <div className="grid gap-3">
          {processedImages.map((image) => (
            <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded border overflow-hidden">
                  <img
                    src={image.processed}
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {image.file.name}
                  </p>
                  <p className="text-xs text-gray-600">Processado</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDownloadSingle(image)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <FileImage className="h-4 w-4" />
                <span>Baixar</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
