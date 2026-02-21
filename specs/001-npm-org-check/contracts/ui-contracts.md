# UI Component Contracts

## OrgNameChecker Component

### Props Interface

```typescript
interface OrgNameCheckerProps {
  /** Callback fired when availability status changes */
  onAvailabilityChange?: (isAvailable: boolean | null) => void;
  /** Callback fired when validation errors occur */
  onValidationError?: (errors: string[]) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Whether the input should be auto-focused */
  autoFocus?: boolean;
}
```

### Behavior Contract

- **Input Handling**: Accepts text input, validates on each keystroke
- **Debouncing**: Waits 300ms after user stops typing to check availability
- **Validation**: Real-time format validation with immediate feedback
- **Accessibility**: Full keyboard navigation and screen reader support

### Events

- `onAvailabilityChange`: Fired when npm registry check completes
- `onValidationError`: Fired when validation errors are detected

## AvailabilityIndicator Component

### Props Interface

```typescript
interface AvailabilityIndicatorProps {
  /** Whether the name is available (null = unknown/not checked) */
  isAvailable: boolean | null;
  /** Whether an availability check is in progress */
  isChecking: boolean;
  /** Additional CSS class names */
  className?: string;
}
```

### Visual States

- **Available**: Green checkmark (✅) + "Available" text
- **Unavailable**: Red X (❌) + "Unavailable" text
- **Checking**: Loading spinner + "Checking..." text
- **Unknown**: No indicator (null state)

### Accessibility

- Uses ARIA live region for status announcements
- Color indicators supplemented with text and icons
- High contrast compliance

## ErrorMessage Component

### Props Interface

```typescript
interface ErrorMessageProps {
  /** Array of validation error messages */
  validationErrors?: string[];
  /** API error object if present */
  apiError?: ApiError;
  /** Whether to show technical details */
  showTechnicalDetails?: boolean;
  /** Callback for retry action */
  onRetry?: () => void;
}
```

### Display Logic

- Prioritizes validation errors over API errors
- Shows technical error details when enabled
- Provides retry button for recoverable errors
- Uses semantic HTML for accessibility

## Application State Contract

### Global Application State

```typescript
interface AppState {
  // No global state required - component-managed state only
}
```

### Component State Management

- All state managed within individual components
- Custom hooks encapsulate business logic
- No external state management library required

## API Integration Contract

### NPM Registry API

```typescript
interface NpmRegistryApi {
  checkAvailability(orgName: string): Promise<AvailabilityResult>;
}

interface AvailabilityResult {
  isAvailable: boolean;
  checkedAt: Date;
  source: 'npm-registry';
}
```

### Error Handling

```typescript
interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  timestamp: Date;
}
```

## Performance Contract

### Response Time Requirements

- **Input Validation**: <10ms (client-side)
- **API Response**: No maximum requirement (per specification)
- **UI Updates**: <16ms (60fps target)
- **Initial Load**: <200ms

### Debouncing Contract

- **Input Debounce**: 300ms delay
- **Validation**: No debounce (immediate)
- **API Calls**: Only on valid, debounced input

## Accessibility Contract

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: All interactive elements reachable via Tab
- **Screen Reader Support**: ARIA labels and live regions
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Visible focus states for all interactive elements

### Semantic HTML

- Input fields use proper `<input>` elements
- Error messages use `<div>` with appropriate ARIA roles
- Loading states communicated via ARIA live regions

## Responsive Design Contract

### Breakpoints

- **Mobile**: <640px (full-width input)
- **Desktop**: ≥640px (600px max-width, centered)

### Layout Requirements

- Input field: Full-width on mobile, 600px max on desktop
- Centered layout on all screen sizes
- Touch-friendly target sizes on mobile

## Testing Contract

### Unit Test Coverage

- **Components**: 100% statement coverage
- **Hooks**: 100% branch coverage
- **Utilities**: 100% function coverage
- **Type Definitions**: No coverage required

### Integration Test Coverage

- **API Integration**: Mocked npm registry calls
- **User Workflows**: Complete user journeys
- **Error Scenarios**: Network failures, validation errors
- **Accessibility**: Screen reader and keyboard navigation
