# Shop.App Admin Testing Guide

## Overview

The Shop.App admin portal uses Jest for testing React components and service layers that interact with the catalog API and other microservices.

## Test Architecture

Tests are organized following these principles:

1. **Service Tests**: Test API interactions with proper mocking
2. **Component Tests**: Test rendering and user interactions
3. **Redux Tests**: Test state management

## Running Tests

```bash
# Run all tests
npm test

# Run just the working test suite
npm run test:working

# Run tests in watch mode
npm run test:watch
```

## Testing Guidelines

### Writing Service Tests

Services that interact with APIs should:

1. Mock the fetch API responses
2. Test both success and error conditions
3. Follow the type-safe patterns:

```typescript
// Example service test pattern
test('service fetches data correctly', async () => {
  // Arrange - Mock API response with proper typing
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockData),
    status: 200
  } as Response);
  
  // Act
  const result = await service.getData();
  
  // Assert with proper type conversions
  const typedResult = result as unknown as ExpectedType;
  expect(typedResult.Id).toBe('expected-id');
});
```

### Writing Component Tests

Components should be tested for:

1. Rendering with different props
2. User interactions (clicks, inputs)
3. Snapshot testing (when component UI is stable)

### Authentication Mocking

Authentication token is mocked in the `setupTests.ts` file. For service tests that need auth:

```typescript
// Ensure consistent auth token mocking in beforeEach
jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
  if (key === 'authToken') return 'test-token';
  return null;
});
```

## Troubleshooting

### Common Issues

1. **Type Errors**: Use proper type assertions with the unknown intermediary: `result as unknown as ExpectedType`
2. **Authentication Errors**: Ensure auth token mocking in localStorage and sessionStorage
3. **API Mocking**: Use jest.fn() for global.fetch and mock all aspects of the Response

### Jest Configuration

The admin app uses a simplified Jest configuration to work properly in the monorepo environment, avoiding conflicts with other service dependencies.

### Testing CDN Interactions

When testing components or services that interact with the CDN for image uploads:

1. Mock global.uploadImageToCdn function
2. Test both success and error cases
3. Verify image URL transformations match expected patterns
