# Jedison + React + Material-UI Demo

This demo shows how to create custom Jedison editors using React and Material-UI (MUI) components while maintaining Jedison's standard behavior of storing all form data in a hidden input with complete JSON.

## Quick Start

Simply open `index.html` in your web browser. No build step required!

```bash
# From the project root
open demos/react-mui/index.html

# Or using a local server (recommended)
cd demos/react-mui
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## What This Demonstrates

### 1. Complete Form with JSON Output
- The form displays multiple input types (text, select, checkbox, switch, nested objects)
- All values are automatically synchronized to a **hidden input containing complete JSON**
- This is standard Jedison behavior - perfect for traditional form submissions

### 2. Custom React MUI Editors
Four custom editors showcasing different component types:
- **ReactMuiTextField** - MUI TextField for string inputs
- **ReactMuiSelect** - MUI Select for enum/options
- **ReactMuiCheckbox** - MUI Checkbox for booleans
- **ReactMuiSwitch** - MUI Switch for booleans (alternative)

### 3. Framework Integration Features
Each custom editor demonstrates:
- **Lifecycle hooks**: Cleanup on destroy
- **Value sync helpers**: `syncValueToJedison()` and `syncValueFromJedison()`
- **Cleanup system**: `registerCleanup()` for React root cleanup
- **Proper memory management**: No memory leaks

## File Structure

```
demos/react-mui/
├── index.html              # Main demo page
├── schema.json             # Example JSON Schema
├── editors/
│   └── ReactMuiEditors.js  # Custom MUI editor implementations
└── README.md               # This file
```

## How It Works

### 1. Schema Configuration

In `schema.json`, each property specifies which custom editor to use via `x-editor`:

```json
{
  "username": {
    "type": "string",
    "x-editor": "react-mui-textfield"
  },
  "role": {
    "type": "string",
    "enum": ["admin", "editor", "viewer"],
    "x-editor": "react-mui-select"
  }
}
```

### 2. Custom Editor Implementation

Each editor extends `Jedison.Editor` and implements:

```javascript
class ReactMuiTextField extends Jedison.Editor {
  static resolves(schema) {
    // Determine if this editor should handle the schema
    return schema['x-editor'] === 'react-mui-textfield'
  }

  build() {
    // Create React root
    this.reactRoot = ReactDOM.createRoot(this.containerElement)

    // Render MUI component
    this.renderComponent()

    // Register cleanup
    this.registerCleanup(() => {
      this.reactRoot.unmount()
    })
  }

  renderComponent() {
    const value = this.syncValueFromJedison() // Read from Jedison

    this.reactRoot.render(
      React.createElement(TextField, {
        value: value,
        onChange: (e) => this.syncValueToJedison(e.target.value) // Write to Jedison
      })
    )
  }

  refreshUI() {
    super.refreshUI()
    this.renderComponent() // Re-render when Jedison updates
  }
}
```

### 3. Jedison Initialization

```javascript
const jedisonInstance = new Jedison.Create({
  container: document.getElementById('form'),
  schema: schema,
  data: initialData,
  customEditors: [
    ReactMuiEditors.ReactMuiTextField,
    ReactMuiEditors.ReactMuiSelect,
    // ... more custom editors
  ]
})

// Listen for changes
jedisonInstance.on('change', () => {
  const json = jedisonInstance.getValue() // Get complete JSON
  console.log('Form data:', json)
})
```

## Hidden Input Behavior

Just like standard Jedison, all form data is stored in a hidden input:

```html
<input type="hidden" name="jedison-data" value='{"username":"johndoe","email":"john@example.com",...}'>
```

This allows traditional form submissions to work seamlessly:

```html
<form action="/submit" method="POST">
  <div id="jedison-form"></div>
  <button type="submit">Submit</button>
</form>
```

On submission, the server receives the complete JSON in the `jedison-data` field.

## Extending This Demo

### Adding More Schemas

You can easily add more complex schemas to test different scenarios:

1. Create a new JSON file in the same directory (e.g., `complex-schema.json`)
2. Update the fetch URL in `index.html`
3. Add any new custom editors needed for new field types

### Adding More Custom Editors

To add a new custom editor:

1. Create the editor class in `editors/ReactMuiEditors.js`:
```javascript
class ReactMuiDatePicker extends Jedison.Editor {
  static resolves(schema) {
    return schema.format === 'date' && schema['x-editor'] === 'react-mui-datepicker'
  }
  // ... implementation
}
```

2. Export it:
```javascript
window.ReactMuiEditors = {
  // ... existing editors
  ReactMuiDatePicker
}
```

3. Register it with Jedison:
```javascript
customEditors: [
  // ... existing editors
  ReactMuiEditors.ReactMuiDatePicker
]
```

4. Use it in your schema:
```json
{
  "birthdate": {
    "type": "string",
    "format": "date",
    "x-editor": "react-mui-datepicker"
  }
}
```

## Integrating Into Your React Project

To use these custom editors in your own React project:

1. **Install Dependencies**:
```bash
npm install jedison @mui/material @emotion/react @emotion/styled
```

2. **Copy and Adapt Editors**:
   - Copy the editor implementations from `editors/ReactMuiEditors.js`
   - Convert to ES6 imports instead of global variables
   - Adapt to your build system (Webpack, Vite, etc.)

3. **Use in Your App**:
```jsx
import { Create } from 'jedison'
import { ReactMuiTextField, ReactMuiSelect } from './editors/ReactMuiEditors'

function MyForm() {
  const containerRef = useRef(null)

  useEffect(() => {
    const jedison = new Create({
      container: containerRef.current,
      schema: mySchema,
      customEditors: [ReactMuiTextField, ReactMuiSelect]
    })

    return () => jedison.destroy()
  }, [])

  return <div ref={containerRef} />
}
```

## Key Features Demonstrated

✅ Custom React components as Jedison editors
✅ Material-UI integration
✅ Complete JSON in hidden input (standard Jedison behavior)
✅ Proper cleanup (no memory leaks)
✅ Value synchronization between React and Jedison
✅ Validation error display
✅ Disabled/read-only state handling
✅ Nested object support

## Browser Compatibility

This demo uses modern browser features:
- React 18
- Material-UI v6
- ES6+ JavaScript

Tested in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes

- **No build step required**: This demo loads everything from CDN for simplicity
- **Production use**: For production, use a proper build system (Webpack, Vite, etc.)
- **Framework dependencies**: Only in your custom editors, NOT in Jedison core
- **Backward compatibility**: All existing Jedison code continues to work unchanged

## Related Resources

- [Framework Integration Guide](../../_tasks/2025-10-29_framework-agnostic-improvements/framework-integration-guide.md)
- [Jedison Documentation](https://germanbisurgi.github.io/jedison-docs/)
- [Material-UI Documentation](https://mui.com/)
- [React Documentation](https://react.dev/)
