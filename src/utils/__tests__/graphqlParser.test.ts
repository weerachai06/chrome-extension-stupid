import { 
  parseGraphQLRequest, 
  getOperationName, 
  matchesPattern, 
  parseGraphQLQuery 
} from '../graphqlParser';

describe('graphqlParser', () => {
  describe('parseGraphQLRequest', () => {
    it('should parse valid JSON body', () => {
      const body = JSON.stringify({ query: '{ user { id } }' });
      expect(parseGraphQLRequest(body)).toEqual({ query: '{ user { id } }' });
    });

    it('should return null for invalid JSON', () => {
      expect(parseGraphQLRequest('invalid json')).toBeNull();
    });

    it('should return null if query is missing', () => {
      const body = JSON.stringify({ variables: {} });
      expect(parseGraphQLRequest(body)).toBeNull();
    });
  });

  describe('getOperationName', () => {
    it('should extract operationName from JSON body if present', () => {
      const body = JSON.stringify({ 
        operationName: 'GetUser', 
        query: 'query GetUser { user { id } }' 
      });
      expect(getOperationName(body)).toBe('GetUser');
    });

    it('should parse operationName from query string if not in JSON root', () => {
      const body = JSON.stringify({ 
        query: 'query GetUser { user { id } }' 
      });
      expect(getOperationName(body)).toBe('GetUser');
    });

    it('should handle mutations', () => {
      const body = JSON.stringify({ 
        query: 'mutation CreatePost { createPost { id } }' 
      });
      expect(getOperationName(body)).toBe('CreatePost');
    });

    it('should return null for anonymous queries', () => {
      const body = JSON.stringify({ query: '{ user { id } }' });
      expect(getOperationName(body)).toBeNull();
    });
  });

  describe('matchesPattern', () => {
    it('should match exact string', () => {
      expect(matchesPattern('GetUser', ['GetUser'])).toBe(true);
      expect(matchesPattern('GetUser', ['GetPosts'])).toBe(false);
    });

    it('should be case-insensitive for exact match', () => {
      expect(matchesPattern('getuser', ['GetUser'])).toBe(true);
    });

    it('should handle wildcard *', () => {
      expect(matchesPattern('GetUser', ['Get*'])).toBe(true);
      expect(matchesPattern('GetPosts', ['Get*'])).toBe(true);
      expect(matchesPattern('CreatePost', ['Get*'])).toBe(false);
    });

    it('should handle global wildcard', () => {
      expect(matchesPattern('Anything', ['*'])).toBe(true);
    });
  });

  describe('parseGraphQLQuery', () => {
    it('should identify query type', () => {
      const result = parseGraphQLQuery('query GetUser { user { id } }');
      expect(result.type).toBe('query');
      expect(result.operationName).toBe('GetUser');
      expect(result.isValid).toBe(true);
    });

    it('should identify mutation type', () => {
      const result = parseGraphQLQuery('mutation CreatePost { id }');
      expect(result.type).toBe('mutation');
      expect(result.isValid).toBe(true);
    });

    it('should handle anonymous shorthand queries', () => {
      const result = parseGraphQLQuery('{ user { id } }');
      expect(result.isValid).toBe(true);
      expect(result.type).toBeNull();
    });

    it('should return invalid for non-graphql strings', () => {
      const result = parseGraphQLQuery('not a query');
      expect(result.isValid).toBe(false);
    });
  });
});
