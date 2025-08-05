export const generateId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
