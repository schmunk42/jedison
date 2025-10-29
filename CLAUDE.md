# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jedison is a JavaScript library for JSON validation and form generation from JSON Schemas. It bridges backend validation with frontend interactive forms, supporting both client-side and server-side workflows.

**Key Features:**
- Auto-generates forms from JSON Schema
- Real-time validation with error display
- Multi-format distribution (ESM, CommonJS, UMD)
- Support for all JSON Schema drafts (04, 06, 07, 2019-09, 2020-12)
- 33+ editor types, 35+ validation constraints
- Multi-theme support (Bootstrap 3, 4, 5)
- 20+ language translations

## Development Commands

### Setup and Development
```bash
yarn install              # Install dependencies
yarn dev                  # Start dev server on http://localhost:8282
yarn serve                # Preview production build on http://localhost:8181
```

### Building
```bash
yarn build                # Production build (creates dist/esm, dist/cjs, dist/umd)
yarn prebuild             # Build for GitHub Pages (outputs to docs/)
```

**Important:** Always run `yarn build` before `yarn unit` tests, as tests require the built distribution.

### Testing
```bash
# Unit tests (requires build first)
yarn build && yarn unit   # Run Jest unit tests

# E2E tests
yarn e2e                  # Run e2e tests with 10 parallel workers
yarn e2e:b3               # Test Bootstrap 3 theme
yarn e2e:b4               # Test Bootstrap 4 theme
yarn e2e:b5               # Test Bootstrap 5 theme
yarn e2e:*                # Test all themes sequentially
yarn e2e:grep             # Debug specific tests (use @tag in test name)

# Full test suite
yarn test:full            # Run serve, e2e, and unit tests
```

**E2E Test Debugging:**
- Set `SHOW=true` to see browser: `SHOW=true yarn e2e`
- Use `--grep '@tag'` to run specific tests
- Tests run in Chrome/Chromium at 1400x5000px resolution
- Output/screenshots in `tests/e2e/output/`

### Code Quality
```bash
yarn lint                 # Check code with ESLint
yarn lint:fix             # Auto-fix ESLint issues
```

### Publishing
```bash
yarn release              # Publish to npm (requires version bump first)
npm version patch|minor|major  # Bump version and auto-push tags
```

## Architecture

### Core Design Pattern: Instance-Editor Separation

Jedison separates data management from UI rendering:

```
Instance (Data Model)              Editor (UI Controller)
├─ Represents JSON value     ←→   ├─ Renders UI elements
├─ Handles validation             ├─ Handles user interaction
├─ Manages state/children         ├─ Manages visual state
└─ Emits events                   └─ Updates instance value
```

**Key Classes:**
- `Jedison` (src/jedison.js) - Main entry point, instance factory
- `Instance` (src/instances/instance.js) - Base class for all instance types
- `Editor` (src/editors/editor.js) - Base class for all editor types
- `UiResolver` (src/ui-resolver.js) - Registry that matches schemas to editors
- `Validator` (src/validation/validator.js) - Multi-draft JSON Schema validation
- `Theme` (src/themes/theme.js) - Abstract theme interface

### Instance Types

8 instance types in `src/instances/`:
- `InstanceString`, `InstanceNumber`, `InstanceBoolean` - Primitives
- `InstanceArray`, `InstanceObject` - Collections
- `InstanceNull` - Null values
- `InstanceMultiple` - oneOf/anyOf handling
- `InstanceIfThenElse` - Conditional schemas

### Editor Resolution

The `UiResolver` maintains a registry of 33+ editors. Each editor has a static `resolves(schema)` method that returns true/false. Resolution order matters - editors are tested sequentially until a match is found.

**Editor Categories:**
- String: input, textarea, select, radios, email, date, markdown (SimpleMDE, Quill, Jodit)
- Number: input, select, range, radios, rating, masked
- Boolean: checkbox, radios, select
- Array: table, navigation, choices, checkboxes
- Object: default, navigation, grid layout
- Compound: if-then-else, oneOf/anyOf switcher

### Schema Extensions (x-options)

Jedison extends JSON Schema with custom properties using the `x-` prefix:

```json
{
  "type": "string",
  "x-editor": "string-select",
  "x-hidden": false,
  "x-showErrors": "always",
  "x-messages": { "en": { "required": "Custom error message" } }
}
```

### Value Change Flow

```
User Input in Editor
  ↓
Editor event listener triggered
  ↓
Instance.setValue(newValue)
  ↓
Instance.validate() → Validator.getErrors()
  ↓
Instance.emit('change')
  ↓
Jedison.emit('change')
  ↓
Hidden input updated (for form submission)
  ↓
UI refreshed with validation errors
```

### Path System

All instances use JSON Pointer-style paths:
- Root: `#`
- Separator: `/`
- Example: `#/properties/user/items/0/name`

Use `jedison.watch(path, callback)` to observe specific instance changes.

## Project Structure

```
src/
├── index.js                    # Main export
├── jedison.js                  # Core Jedison class
├── event-emitter.js            # Observer pattern implementation
├── ui-resolver.js              # Editor matching logic
├── instances/                  # 8 instance types
├── editors/                    # 33+ editor implementations
├── validation/
│   ├── validator.js            # Multi-draft validator
│   ├── drafts/                 # JSON Schema draft implementations
│   └── constrains/             # 35+ constraint validators
├── themes/                     # Bootstrap 3/4/5 themes
├── helpers/
│   ├── schema.js               # 50+ schema utility functions
│   └── utils.js                # General utilities
├── i18n/                       # Translation system
├── ref-parser/                 # $ref resolution
└── schema-generator/           # Programmatic schema creation

tests/
├── unit/
│   ├── jest.config.cjs
│   └── tests/                  # Jest unit tests
└── e2e/
    ├── codecept.conf.cjs
    ├── steps_file.cjs
    └── tests/                  # 80+ CodeceptJS tests

src-docs/                       # Vue documentation site
dist/                           # Built distribution (esm, cjs, umd)
docs/                           # GitHub Pages output
```

## Build Configuration

Three Vite configs for different purposes:
- `vite.config.prod.js` - Production build (dist/)
- `vite.config.dev.js` - Dev server and preview (ports 8282/8181)
- `vite.config.pages.js` - GitHub Pages build (docs/)

## Common Development Tasks

### Adding a New Editor

1. Create editor class in `src/editors/` extending `Editor`
2. Implement static `resolves(schema)` method
3. Implement `build()` method to construct UI
4. Register in `src/ui-resolver.js` (order matters!)
5. Add tests in `tests/e2e/tests/`
6. Update documentation in `src-docs/`

### Adding a New Validation Constraint

1. Create constraint in `src/validation/constrains/`
2. Implement `validate(instance, schema)` method
3. Add error messages to `src/i18n/default-translations.js`
4. Register in appropriate draft validator
5. Add unit tests using JSON Schema Test Suite format

### Debugging E2E Tests

Use the grep script for focused debugging:
```bash
SHOW=true THEME='bootstrap5' codeceptjs run \
  -c tests/e2e/codecept.conf.cjs \
  --steps --debug \
  --grep '@your-tag'
```

Add `@your-tag` to test description, set `SHOW=true` to see browser.

### Adding Translations

1. Add new language to `src/i18n/default-translations.js`
2. Provide translations for all validator error messages
3. Test with `jedison.setOption('locale', 'your-lang')`

## Important Conventions

### Code Style
- ES6+ module syntax (ESM)
- Standard ESLint configuration
- Use `const` for immutables, `let` for mutables
- Prefer template literals over string concatenation
- Use arrow functions for callbacks

### Event Handling
- All instances and editors extend `EventEmitter`
- Use `on(name, callback)` to listen, `emit(name, ...args)` to fire
- Always clean up listeners in `destroy()` methods

### Instance Lifecycle
1. `constructor(config)` - Initialize properties
2. `init()` - Register with Jedison
3. `register()` - Register with parent
4. `setInitialValue()` - Set from config or data
5. `prepare()` - Prepare for UI
6. `setDefaultValue()` - Apply defaults if no initial value
7. Active lifecycle - value changes, validation
8. `destroy()` - Clean up listeners and properties

### Memory Management
- Always implement `destroy()` methods
- Remove event listeners when destroying
- Clean up DOM references
- Use `jedison.destroy()` when removing instance

## Resources

- **Playground:** https://germanbisurgi.github.io/jedison/index.html?theme=bootstrap5
- **Documentation:** https://germanbisurgi.github.io/jedison-docs/
- **JSON Schema Spec:** https://json-schema.org/understanding-json-schema
- **Test Suite:** https://github.com/json-schema-org/JSON-Schema-Test-Suite

## Notes

- The library supports both programmatic instantiation and CDN usage
- Hidden input pattern allows traditional form submission
- Theme system is abstracted - easy to add new UI frameworks
- Validator is fully compliant with JSON Schema specifications
- All 33+ editors can be extended or replaced via UiResolver registry
