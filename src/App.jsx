import React, { useState, useRef } from 'react';
import { ThemeForm } from './components/core/ThemeForm';
import { Download, Upload, Code } from 'lucide-react';
import { getLatestSchema } from './components/schemaVersions';

const App = () => {
  const [schema, setSchema] = useState(null);
  const [schemaVersion, setSchemaVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const fileInputRef = useRef(null);
  const themeFormRef = useRef(null);

  React.useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        const { schema: schemaData, version } = await getLatestSchema();
        setSchema(schemaData);
        setSchemaVersion(version);
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
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-lg">Loading schema...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
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
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">
              Power BI Theme Editor
            </h1>
            {schemaVersion && (
              <div className="text-sm text-gray-600 mt-1">
                Schema Version: <span className="font-medium text-blue-800">v{schemaVersion}</span>
              </div>
            )}
          </div>
          <div className="space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
            />
            <button 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              onClick={() => setShowJson(!showJson)}
            >
              <Code className="w-4 h-4 mr-2 inline" />
              View JSON
            </button>
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
      <main className="flex-grow overflow-hidden w-full flex">
        <div className="w-full h-full px-6 overflow-auto">
          <ThemeForm ref={themeFormRef} schema={schema} />
        </div>
        {showJson && (
          <div className="w-1/3 h-full border-l border-gray-200 overflow-auto bg-gray-50">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Current Theme JSON</h2>
              <pre className="bg-white p-4 rounded border text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(themeFormRef.current?.getThemeData() || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;