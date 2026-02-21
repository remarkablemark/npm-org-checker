# Quickstart Guide: NPM Organization Name Availability Checker

**Purpose**: Rapid development setup and implementation guidance for the npm organization name availability checker feature.

## Development Setup

### Prerequisites

- Node.js 24+ (as specified in `.nvmrc`)
- npm or yarn package manager
- Modern web browser for testing
- Git for version control

### Initial Setup

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd npm-org-checker

# Install dependencies
npm install

# Start development server
npm start
```

The development server will start at `http://localhost:5173` with hot module replacement.

## Component Implementation Priority

### Phase 1: Core Components (P1)

1. **OrgNameChecker Component**
   - Input field with debouncing
   - Real-time validation
   - API integration hook
   - Error handling

2. **AvailabilityIndicator Component**
   - Visual status indicators (✅/❌/spinner)
   - Accessibility support
   - Responsive design

3. **useOrgNameValidator Hook**
   - Client-side validation logic
   - Error message generation
   - Real-time feedback

### Phase 2: Enhanced Features (P2)

4. **useAvailabilityChecker Hook**
   - API integration with corsmirror.com
   - Error handling and retry logic
   - Loading state management

5. **ErrorMessage Component**
   - Technical error display
   - Retry functionality
   - Accessibility features

### Phase 3: Advanced Features (P3)

6. **Batch Checking Feature**
   - Multiple name input
   - Results table
   - Bulk operations

## Key Implementation Details

### Validation Rules

```typescript
// npm organization name validation pattern
const ORG_NAME_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;
const MIN_LENGTH = 1;
const MAX_LENGTH = 214;
const RESERVED_WORDS = ['npm', 'node', 'package', 'module'];
```

### API Integration

```typescript
// CORS proxy endpoint
const CORS_PROXY = 'https://corsmirror.com/';
const NPM_REGISTRY = 'https://registry.npmjs.org/';

// Availability check endpoint
const checkAvailability = async (orgName: string) => {
  const response = await fetch(`${CORS_PROXY}${NPM_REGISTRY}org/${orgName}`, {
    method: 'HEAD',
  });
  return response.status === 404; // 404 means available
};
```

### Debouncing Implementation

```typescript
// 300ms debounce for API calls
const debouncedCheck = useMemo(
  () =>
    debounce((name: string) => {
      if (isValid) checkAvailability(name);
    }, 300),
  [isValid],
);
```

## Testing Strategy

### Test-First Development

1. **Write tests first** for each component/hook
2. **Run tests** to ensure they fail (red phase)
3. **Implement minimal code** to make tests pass (green phase)
4. **Refactor** while maintaining test coverage (refactor phase)

### Test Structure

```bash
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.test.tsx    # Component tests
│   │   └── ...
├── hooks/
│   ├── useHookName.test.ts          # Hook tests
│   └── ...
└── utils/
    ├── utilityName.test.ts          # Utility tests
    └── ...
```

### Running Tests

```bash
# Run all tests with coverage
npm run test:ci

# Run specific test file
npm test -- src/components/OrgNameChecker/OrgNameChecker.test.tsx

# Watch mode during development
npm test
```

## Styling Guidelines

### Tailwind CSS Usage

- Use utility classes only (no custom CSS)
- Responsive design with `sm:`, `md:`, `lg:` prefixes
- Dark mode support with `dark:` prefix
- Component variants using consistent patterns

### Component Styling

```typescript
// Example: Input field styling
const inputClasses = `
  w-full md:max-w-[600px]
  px-4 py-3
  text-lg
  border-2 border-gray-300
  rounded-lg
  focus:border-blue-500
  focus:outline-none
  transition-colors
`;
```

## Accessibility Implementation

### ARIA Labels

```typescript
<input
  aria-label="Organization name"
  aria-describedby={errorId}
  aria-invalid={hasError}
  {...props}
/>
```

### Screen Reader Support

```typescript
// Live region for status updates
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {availabilityMessage}
</div>
```

## Error Handling

### Validation Errors

- Display immediately below input field
- Use semantic HTML for accessibility
- Provide specific, actionable error messages

### API Errors

- Show technical details to developer users
- Include retry functionality
- Log errors for debugging

## Performance Optimization

### React Compiler

- No manual `useMemo` or `useCallback` unless absolutely necessary
- Let React Compiler handle optimization
- Focus on clean, readable code

### Bundle Optimization

- Code splitting not needed for small application
- Tree shaking handled by Vite
- Minification in production builds

## Deployment

### Build Process

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Static Hosting

The application can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Development Workflow

### Git Workflow

1. Create feature branch from `main`
2. Implement components with TDD
3. Run linting and type checking
4. Ensure all tests pass with coverage
5. Submit pull request

### Quality Gates

```bash
# Lint code
npm run lint

# Type checking
npm run lint:tsc

# Full test suite with coverage
npm run test:ci
```

All quality gates must pass before merging.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure corsmirror.com proxy is correctly configured
2. **Validation Failures**: Check regex patterns and reserved words list
3. **Test Failures**: Verify mock implementations for API calls
4. **Build Errors**: Ensure TypeScript strict mode compliance

### Debugging Tips

- Use browser dev tools for network requests
- Check console for React warnings
- Verify Tailwind CSS classes are applied
- Test accessibility with screen reader tools
