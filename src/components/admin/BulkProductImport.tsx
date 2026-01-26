import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Eye,
  ArrowLeft,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductForm } from '@/types';

interface ParsedProduct {
  row: number;
  data: ProductForm;
  errors: string[];
  isValid: boolean;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

interface BulkProductImportProps {
  onImportComplete: () => void;
  onClose: () => void;
}

const BulkProductImport: React.FC<BulkProductImportProps> = ({ onImportComplete, onClose }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Template columns
  const templateColumns = [
    'product_code',
    'brand',
    'name',
    'width',
    'aspect_ratio',
    'rim_diameter',
    'dimensions',
    'tire_type',
    'season',
    'stock_quantity',
    'price',
    'description',
    'image_url',
    'is_active'
  ];

  const requiredFields = ['product_code', 'name', 'dimensions', 'price', 'stock_quantity'];

  const downloadTemplate = () => {
    const headers = templateColumns.join(',');
    const sampleRow = [
      'LSS-001',
      'Lassa',
      'Snoways 4',
      '205',
      '55',
      '16',
      '205/55R16',
      'car',
      'winter',
      '100',
      '89.99',
      'Premium winter tire with excellent grip',
      'https://example.com/tire.jpg',
      'true'
    ].join(',');
    
    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'product_import_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const validateAndParseProduct = (row: string[], headers: string[], rowNumber: number): ParsedProduct => {
    const errors: string[] = [];
    const data: Record<string, any> = {};

    // Map CSV columns to data object
    headers.forEach((header, index) => {
      const value = row[index]?.trim() || '';
      data[header] = value;
    });

    // Validate required fields
    if (!data.product_code) errors.push('Product code is required');
    if (!data.name) errors.push('Name is required');
    if (!data.dimensions) errors.push('Dimensions is required');
    if (!data.price || isNaN(parseFloat(data.price))) errors.push('Valid price is required');
    if (!data.stock_quantity || isNaN(parseInt(data.stock_quantity))) errors.push('Valid stock quantity is required');

    // Validate tire_type
    const validTireTypes = ['car', 'truck', 'suv', 'van'];
    if (data.tire_type && !validTireTypes.includes(data.tire_type.toLowerCase())) {
      errors.push(`Invalid tire type. Must be one of: ${validTireTypes.join(', ')}`);
    }

    // Validate season
    const validSeasons = ['summer', 'winter', 'all-season'];
    if (data.season && !validSeasons.includes(data.season.toLowerCase())) {
      errors.push(`Invalid season. Must be one of: ${validSeasons.join(', ')}`);
    }

    // Parse and format data
    const productData: ProductForm = {
      product_code: data.product_code || '',
      brand: data.brand || 'Lassa',
      name: data.name || '',
      width: data.width ? parseInt(data.width) : undefined,
      aspect_ratio: data.aspect_ratio ? parseInt(data.aspect_ratio) : undefined,
      rim_diameter: data.rim_diameter ? parseInt(data.rim_diameter) : undefined,
      dimensions: data.dimensions || '',
      tire_type: (data.tire_type?.toLowerCase() as any) || 'car',
      season: (data.season?.toLowerCase() as any) || 'summer',
      stock_quantity: parseInt(data.stock_quantity) || 0,
      price: parseFloat(data.price) || 0,
      description: data.description || '',
      image_url: data.image_url || '',
      is_active: data.is_active?.toLowerCase() !== 'false'
    };

    return {
      row: rowNumber,
      data: productData,
      errors,
      isValid: errors.length === 0
    };
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        alert('CSV file must have a header row and at least one data row');
        setIsProcessing(false);
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      // Validate headers
      const missingRequired = requiredFields.filter(field => !headers.includes(field));
      if (missingRequired.length > 0) {
        alert(`Missing required columns: ${missingRequired.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      const parsed = dataRows.map((row, index) => 
        validateAndParseProduct(row, headers, index + 2)
      );

      setParsedProducts(parsed);
      setStep('preview');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    const validProducts = parsedProducts.filter(p => p.isValid);
    if (validProducts.length === 0) {
      alert('No valid products to import');
      return;
    }

    setIsProcessing(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const product of validProducts) {
      try {
        const { error } = await supabase.from('products').insert(product.data);
        if (error) {
          result.failed++;
          result.errors.push({ row: product.row, error: error.message });
        } else {
          result.success++;
        }
      } catch (error: any) {
        result.failed++;
        result.errors.push({ row: product.row, error: error.message || 'Unknown error' });
      }
    }

    // Count invalid products as failed
    const invalidProducts = parsedProducts.filter(p => !p.isValid);
    result.failed += invalidProducts.length;
    invalidProducts.forEach(p => {
      result.errors.push({ row: p.row, error: p.errors.join('; ') });
    });

    setImportResult(result);
    setStep('result');
    setIsProcessing(false);
  };

  const validCount = parsedProducts.filter(p => p.isValid).length;
  const invalidCount = parsedProducts.filter(p => !p.isValid).length;

  return (
    <div className="p-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'upload' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>1</div>
            <span className="font-medium">Upload</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${step === 'preview' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'preview' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>2</div>
            <span className="font-medium">Preview</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${step === 'result' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'result' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>3</div>
            <span className="font-medium">Result</span>
          </div>
        </div>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Download CSV Template</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Start with our template to ensure your data is formatted correctly. Required fields: 
                  <span className="font-medium"> product_code, name, dimensions, price, stock_quantity</span>
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
                <p className="text-gray-600">Processing file...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop your CSV file here
                </p>
                <p className="text-gray-500 mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Upload className="w-5 h-5" />
                  <span>Browse Files</span>
                </button>
                <p className="text-sm text-gray-400 mt-4">Supported format: CSV</p>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Import Instructions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>First row must contain column headers</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Required fields: product_code, name, dimensions, price, stock_quantity</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Valid tire types: car, truck, suv, van</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Valid seasons: summer, winter, all-season</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>is_active accepts: true/false (defaults to true)</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{parsedProducts.length}</p>
              <p className="text-sm text-gray-600">Total Rows</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
              <p className="text-sm text-green-700">Valid Products</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
              <p className="text-sm text-red-700">Invalid Products</p>
            </div>
          </div>

          {/* Preview Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Row</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Product Code</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Dimensions</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedProducts.map((product, index) => (
                    <tr key={index} className={product.isValid ? 'bg-white' : 'bg-red-50'}>
                      <td className="px-4 py-3 text-gray-600">{product.row}</td>
                      <td className="px-4 py-3">
                        {product.isValid ? (
                          <span className="inline-flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Invalid</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-900">{product.data.product_code || '-'}</td>
                      <td className="px-4 py-3 text-gray-900">{product.data.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-900">{product.data.dimensions || '-'}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ${Number(product.data.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">{product.data.stock_quantity}</td>
                      <td className="px-4 py-3">
                        {product.errors.length > 0 && (
                          <div className="text-red-600 text-xs">
                            {product.errors.map((error, i) => (
                              <div key={i}>{error}</div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning for invalid products */}
          {invalidCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Some products have errors</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {invalidCount} product(s) have validation errors and will be skipped during import.
                    Only {validCount} valid product(s) will be imported.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setParsedProducts([]);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleImport}
              disabled={validCount === 0 || isProcessing}
              className="flex items-center space-x-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <span>Import {validCount} Products</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && importResult && (
        <div className="space-y-6">
          {/* Result Summary */}
          <div className="text-center py-6">
            {importResult.success > 0 ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Import {importResult.success > 0 ? 'Completed' : 'Failed'}
            </h3>
            <p className="text-gray-600">
              {importResult.success > 0 
                ? `Successfully imported ${importResult.success} product(s)`
                : 'No products were imported'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{importResult.success}</p>
              <p className="text-sm text-green-700 font-medium">Successfully Imported</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{importResult.failed}</p>
              <p className="text-sm text-red-700 font-medium">Failed / Skipped</p>
            </div>
          </div>

          {/* Error Details */}
          {importResult.errors.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Error Details</h4>
              <div className="max-h-48 overflow-auto space-y-2">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-500 font-mono">Row {error.row}:</span>
                    <span className="text-red-600">{error.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setParsedProducts([]);
                setImportResult(null);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import More</span>
            </button>
            <button
              onClick={() => {
                onImportComplete();
                onClose();
              }}
              className="flex items-center space-x-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkProductImport;
