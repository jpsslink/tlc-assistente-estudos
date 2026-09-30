import '@testing-library/jest-native/extend-expect';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const mockStorage: Record<string, string> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: jest.fn((key: string) => mockStorage[key] ?? undefined),
      set: jest.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      delete: jest.fn((key: string) => {
        delete mockStorage[key];
      }),
      contains: jest.fn((key: string) => key in mockStorage),
      clearAll: jest.fn(() => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      }),
    })),
  };
});
