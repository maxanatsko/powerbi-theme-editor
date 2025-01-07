export const getValue = (obj, path) => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined) return undefined;
    current = current[part];
  }
  return current;
};

export const updateValue = (obj, path, value) => {
  const parts = path.split('.');
  const newObj = { ...obj };
  let current = newObj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = { ...current[part] } || {};
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
  return newObj;
};