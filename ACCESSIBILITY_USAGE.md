# Accessibility Store Usage Guide

The accessibility store provides global access to user accessibility preferences with persistent storage.

## Setup

The `AccessibilityProvider` is already set up in `app/_layout.tsx`, so all screens can access the accessibility settings.

## Usage in Components

```tsx
import { useAccessibility } from '@/stores/accessibility-store';

export default function MyScreen() {
  const { settings, getScaledFontSize } = useAccessibility();

  return (
    <View>
      <Text style={{
        fontSize: getScaledFontSize(16), // Base font size will be scaled
        fontWeight: settings.isBoldTextEnabled ? 'bold' : 'normal',
        color: settings.isDarkTheme ? '#FFFFFF' : '#000000'
      }}>
        This text respects accessibility settings
      </Text>
    </View>
  );
}
```

## Available Settings

- `settings.fontSizeScale`: Number (50-150) - Percentage scale (100 = 100%, 150 = 150%, etc.)
- `settings.isBoldTextEnabled`: Boolean
- `settings.isDarkTheme`: Boolean

## Available Actions

- `increaseFontSize()`: Increases font scale by 10% (max 150%)
- `decreaseFontSize()`: Decreases font scale by 10% (min 50%)
- `toggleBoldText()`: Toggles bold text on/off
- `toggleTheme()`: Switches between light and dark themes
- `getScaledFontSize(baseFontSize)`: Returns scaled font size based on current percentage

## Font Scaling

The font scaling system works on a percentage basis:
- **50%**: Very small text (half size)
- **100%**: Normal text size (default)
- **150%**: Large text (1.5x size)

Each increment/decrement changes the scale by 10%.

## Persistence

All settings are automatically saved to AsyncStorage and restored when the app restarts.

## Example Implementation

See `app/Home/appointments1.tsx` for a complete example of how to apply accessibility settings to text styles.

## Best Practices

1. Always use `getScaledFontSize()` for font sizes instead of hardcoded values
2. Define base font sizes and let the scaling system handle the rest
3. Test your app at different font scales (50%, 100%, 150%) to ensure readability