import { create } from 'zustand';

const useSchemaStore = create((set) => ({
  schema: null,
  isLoading: false,
  error: null,

  setSchema: (schema) => {
    console.log('Setting schema:', schema ? 'present' : 'null');
    set({ schema, error: null });
  },

  setLoading: (isLoading) => {
    console.log('Setting loading:', isLoading);
    set({ isLoading });
  },

  setError: (error) => {
    console.error('Setting error:', error);
    set({ error });
  },

  initializeSchema: async () => {
    console.log('Initializing schema');
    set({ isLoading: true, error: null });
    
    try {
      // For now, just use a minimal schema for testing
      const testSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        }
      };
      
      console.log('Setting test schema');
      set({ schema: testSchema, isLoading: false });
    } catch (error) {
      console.error('Schema initialization error:', error);
      set({ error: error.message, isLoading: false });
    }
  }
}));

// Initialize schema
console.log('About to initialize schema');
useSchemaStore.getState().initializeSchema();

export default useSchemaStore;