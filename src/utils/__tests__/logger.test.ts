import { logger } from '../logger';

describe('logger utility', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('test info');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'test info'
    );
  });

  it('should log error messages with data', () => {
    const errorData = { code: 404 };
    logger.error('failed', errorData);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      'failed',
      errorData
    );
  });

  it('should handle debug messages', () => {
    logger.debug('debug msg');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      'debug msg'
    );
  });

  it('should log to console with prefix', () => {
    logger.warn('warning');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[Debounce Network]'),
      'warning'
    );
  });
});
