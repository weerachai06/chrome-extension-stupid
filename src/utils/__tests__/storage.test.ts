import { saveSettings, loadSettings, DebounceSettings } from '../storage';

// Ensure chrome is defined even if global setup fails
if (typeof (global as any).chrome === 'undefined') {
  (global as any).chrome = require('jest-chrome').chrome;
}

import { chrome } from 'jest-chrome';

describe('storage utility', () => {
  const mockSettings: DebounceSettings = {
    restUrls: ['https://api.example.com'],
    graphqlOperations: ['GetUser'],
    debounceDelay: 500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSettings', () => {
    it('should call chrome.storage.local.set with correct data', async () => {
      chrome.storage.local.set.mockImplementation((data, callback) => {
        if (callback) callback();
      });

      await saveSettings(mockSettings);

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { debounceSettings: mockSettings },
        expect.any(Function)
      );
    });
  });

  describe('loadSettings', () => {
    it('should return settings from storage if present', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ debounceSettings: mockSettings });
      });

      const settings = await loadSettings();
      expect(settings).toEqual(mockSettings);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        ['debounceSettings'],
        expect.any(Function)
      );
    });

    it('should return default settings if storage is empty', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const settings = await loadSettings();
      expect(settings).toEqual({
        restUrls: [],
        graphqlOperations: [],
        debounceDelay: 0,
      });
    });
  });
});
