const GITHUB_API_URL = 'https://api.github.com/repos/microsoft/powerbi-desktop-samples/contents/Report%20Theme%20JSON%20Schema';
const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report%20Theme%20JSON%20Schema';
const LOCAL_SCHEMAS_PATH = '/schemas';

export async function getLatestSchema() {
  try {
    // Try local schema first
    try {
      const localFiles = await window.fs.readdir(LOCAL_SCHEMAS_PATH);
      const schemaFiles = localFiles
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          version: extractVersionFromFilename(file),
          filename: file,
          url: `${LOCAL_SCHEMAS_PATH}/${file}`
        }))
        .sort((a, b) => compareVersions(b.version, a.version));

      if (schemaFiles.length > 0) {
        const content = await window.fs.readFile(schemaFiles[0].url, { encoding: 'utf8' });
        return JSON.parse(content);
      }
    } catch (error) {
      console.log('No local schema found:', error);
    }

    // Fallback to GitHub
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error('Failed to fetch schema list from GitHub');
    
    const files = await response.json();
    const schemas = files
      .filter(file => file.name.endsWith('.json'))
      .map(file => ({
        version: extractVersionFromFilename(file.name),
        filename: file.name,
        url: `${RAW_GITHUB_URL}/${file.name}`
      }))
      .sort((a, b) => compareVersions(b.version, a.version));

    if (schemas.length === 0) {
      throw new Error('No schemas found on GitHub');
    }

    // Get the latest schema content
    const schemaResponse = await fetch(schemas[0].url);
    if (!schemaResponse.ok) throw new Error('Failed to fetch schema content');
    
    const schemaData = await schemaResponse.json();

    // Save it locally for future use
    try {
      await window.fs.mkdir(LOCAL_SCHEMAS_PATH, { recursive: true });
      await window.fs.writeFile(
        `${LOCAL_SCHEMAS_PATH}/${schemas[0].filename}`, 
        JSON.stringify(schemaData, null, 2)
      );
    } catch (error) {
      console.error('Failed to save schema locally:', error);
    }

    return schemaData;
  } catch (error) {
    console.error('Error getting latest schema:', error);
    throw error;
  }
}

function extractVersionFromFilename(filename) {
  const match = filename.match(/reportThemeSchema-(\d+\.\d+)\.json/);
  return match ? match[1] : '0.0';
}

function compareVersions(a, b) {
  const [aMajor, aMinor] = a.split('.').map(Number);
  const [bMajor, bMinor] = b.split('.').map(Number);
  
  if (aMajor !== bMajor) return aMajor - bMajor;
  return aMinor - bMinor;
}