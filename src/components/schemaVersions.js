export const GITHUB_API_URL = 'https://api.github.com/repos/microsoft/powerbi-desktop-samples/contents/Report%20Theme%20JSON%20Schema';
export const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report%20Theme%20JSON%20Schema';

export async function getLatestSchema() {
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error('Failed to fetch schema list');
    
    const files = await response.json();
    const schemaFiles = files
      .filter(file => file.name.startsWith('reportThemeSchema-') && file.name.endsWith('.json'))
      .map(file => ({
        version: extractVersionFromFilename(file.name),
        filename: file.name,
        url: `${RAW_GITHUB_URL}/${file.name}`,
        rawUrl: file.download_url
      }))
      .sort((a, b) => compareVersions(b.version, a.version));

    if (schemaFiles.length === 0) {
      throw new Error('No schema files found');
    }

    const latestSchema = schemaFiles[0];
    const schemaResponse = await fetch(latestSchema.rawUrl);
    if (!schemaResponse.ok) throw new Error('Failed to fetch schema content');
    
    const schemaData = await schemaResponse.json();
    
    // Ensure schema has the correct raw GitHub URL
    schemaData.$schema = latestSchema.rawUrl;
    
    return {
      schema: schemaData,
      version: latestSchema.version,
      url: latestSchema.rawUrl
    };
  } catch (error) {
    console.error('Error fetching latest schema:', error);
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