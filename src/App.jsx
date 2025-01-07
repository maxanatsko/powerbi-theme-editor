import React, { useState, useRef } from 'react';
import { ThemeForm } from './components/core/ThemeForm';
import { Download, Upload } from 'lucide-react';

const SCHEMA_URL = 'https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/refs/heads/main/Report%20Theme%20JSON%20Schema/reportThemeSchema-2.138.json';

const App = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const themeFormRef = useRef(null);

  React.useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(SCHEMA_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch schema: ${response.statusText}`);
        }
        const schemaData = await response.json();
        setSchema(schemaData);
      } catch (err) {
        console.error('Error loading schema:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-lg">Loading schema...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-red-600">
          Error: {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="flex-none bg-white shadow w-full">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Power BI Theme Editor
          </h1>
          <div className="space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
            />
            <button 
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Import
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              onClick={() => {
                const theme = themeFormRef.current?.getThemeData();
                if (!theme) return;
                
                const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'powerbi-theme.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-auto w-full">
        <div className="w-full h-full px-6">
          <ThemeForm ref={themeFormRef} schema={schema} />
        </div>
      </main>
    </div>
  );
};

export default App;