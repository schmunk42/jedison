/**
 * React MUI Demo App
 * A small React component that manages Jedison instance and example schema loading
 */

/* global React, ReactDOM, Jedison, ThemeMui, ReactMuiEditors */

const { useState, useEffect, useRef } = React

// Examples catalog organized by category
const EXAMPLES = {
  'Current Demo': {
    'custom': {
      name: 'User Profile',
      schema: './schema.json'
    }
  },
  'Examples': {
    'contact': {
      name: 'Contact Form',
      schema: '../../src-docs/json/examples/contact.json'
    },
    'login': {
      name: 'Login Form',
      schema: '../../src-docs/json/examples/login.json'
    },
    'john-frusciante': {
      name: 'Musician Profile',
      schema: '../../src-docs/json/examples/john-frusciante.json'
    },
    'geojson': {
      name: 'GeoJSON',
      schema: '../../src-docs/json/examples/geojson.json'
    },
    'resume': {
      name: 'Resume Schema',
      schema: '../../src-docs/json/examples/resume-schema.json'
    },
    'amazon': {
      name: 'Amazon Product',
      schema: '../../src-docs/json/examples/amazon.json'
    }
  },
  'String Editors': {
    'string-input': {
      name: 'String Input',
      schema: '../../src-docs/json/editors/string-input.json'
    },
    'string-textarea': {
      name: 'String Textarea',
      schema: '../../src-docs/json/editors/string-textarea.json'
    },
    'string-select': {
      name: 'String Select',
      schema: '../../src-docs/json/editors/string-select.json'
    },
    'string-radios': {
      name: 'String Radios',
      schema: '../../src-docs/json/editors/string-radios.json'
    },
    'string-radios-inline': {
      name: 'String Radios Inline',
      schema: '../../src-docs/json/editors/string-radios-inline.json'
    },
    'string-awesomplete': {
      name: 'String Awesomplete',
      schema: '../../src-docs/json/editors/string-awesomplete.json'
    }
  },
  'Number Editors': {
    'number-input': {
      name: 'Number Input',
      schema: '../../src-docs/json/editors/number-input.json'
    },
    'integer-input': {
      name: 'Integer Input',
      schema: '../../src-docs/json/editors/integer-input.json'
    },
    'number-input-nullable': {
      name: 'Number Input Nullable',
      schema: '../../src-docs/json/editors/number-input-nullable.json'
    },
    'number-select': {
      name: 'Number Select',
      schema: '../../src-docs/json/editors/number-select.json'
    },
    'number-radios': {
      name: 'Number Radios',
      schema: '../../src-docs/json/editors/number-radios.json'
    },
    'number-radios-inline': {
      name: 'Number Radios Inline',
      schema: '../../src-docs/json/editors/number-radios-inline.json'
    },
    'number-range': {
      name: 'Number Range',
      schema: '../../src-docs/json/editors/number-range.json'
    }
  },
  'Boolean Editors': {
    'boolean-checkbox': {
      name: 'Boolean Checkbox',
      schema: '../../src-docs/json/editors/boolean-checkbox.json'
    },
    'boolean-select': {
      name: 'Boolean Select',
      schema: '../../src-docs/json/editors/boolean-select.json'
    },
    'boolean-radios': {
      name: 'Boolean Radios',
      schema: '../../src-docs/json/editors/boolean-radios.json'
    },
    'boolean-radios-inline': {
      name: 'Boolean Radios Inline',
      schema: '../../src-docs/json/editors/boolean-radios-inline.json'
    }
  },
  'Array Editors': {
    'array': {
      name: 'Array',
      schema: '../../src-docs/json/editors/array.json'
    },
    'array-table': {
      name: 'Array Table',
      schema: '../../src-docs/json/editors/array-table.json'
    },
    'array-table-object': {
      name: 'Array Table Object',
      schema: '../../src-docs/json/editors/array-table-object.json'
    },
    'array-nav-vertical': {
      name: 'Array Nav Vertical',
      schema: '../../src-docs/json/editors/array-nav-vertical.json'
    },
    'array-nav-horizontal': {
      name: 'Array Nav Horizontal',
      schema: '../../src-docs/json/editors/array-nav-horizontal.json'
    },
    'array-checkboxes': {
      name: 'Array Checkboxes',
      schema: '../../src-docs/json/editors/array-checkboxes.json'
    },
    'array-checkboxes-inline': {
      name: 'Array Checkboxes Inline',
      schema: '../../src-docs/json/editors/array-checkboxes-inline.json'
    },
    'array-no-buttons': {
      name: 'Array No Buttons',
      schema: '../../src-docs/json/editors/array-no-buttons.json'
    },
    'array-buttons-content': {
      name: 'Array Buttons Content',
      schema: '../../src-docs/json/editors/array-buttons-content.json'
    },
    'array-enforceMinItems': {
      name: 'Array Enforce Min Items',
      schema: '../../src-docs/json/editors/array-enforceMinItems.json'
    }
  },
  'Object Editors': {
    'object': {
      name: 'Object',
      schema: '../../src-docs/json/editors/object.json'
    },
    'object-grid': {
      name: 'Object Grid',
      schema: '../../src-docs/json/editors/object-grid.json'
    },
    'object-grid-breakpoints': {
      name: 'Object Grid Breakpoints',
      schema: '../../src-docs/json/editors/object-grid-breakpoints.json'
    },
    'object-nav-vertical': {
      name: 'Object Nav Vertical',
      schema: '../../src-docs/json/editors/object-nav-vertical.json'
    },
    'object-nav-horizontal': {
      name: 'Object Nav Horizontal',
      schema: '../../src-docs/json/editors/object-nav-horizontal.json'
    },
    'object-propertyOrder': {
      name: 'Object Property Order',
      schema: '../../src-docs/json/editors/object-propertyOrder.json'
    },
    'object-propGroup': {
      name: 'Object Property Group',
      schema: '../../src-docs/json/editors/object-propGroup.json'
    },
    'object-buttons-content': {
      name: 'Object Buttons Content',
      schema: '../../src-docs/json/editors/object-buttons-content.json'
    },
    'object-enforceAdditionalProperties': {
      name: 'Object Enforce Additional Properties',
      schema: '../../src-docs/json/editors/object-enforceAdditionalProperties.json'
    },
    'object-enforceRequired': {
      name: 'Object Enforce Required',
      schema: '../../src-docs/json/editors/object-enforceRequired.json'
    }
  },
  'Other Editors': {
    'null': {
      name: 'Null Editor',
      schema: '../../src-docs/json/editors/null.json'
    },
    'editor-hidden': {
      name: 'Hidden Editor',
      schema: '../../src-docs/json/editors/editor-hidden.json'
    },
    'editor-containerAttributes': {
      name: 'Container Attributes',
      schema: '../../src-docs/json/editors/editor-containerAttributes.json'
    },
    'show-errors-input-mixed': {
      name: 'Show Errors Mixed',
      schema: '../../src-docs/json/editors/show-errors-input-mixed.json'
    },
    'all': {
      name: 'All Editors',
      schema: '../../src-docs/json/editors/all.json'
    }
  },
  'Features': {
    'templates': {
      name: 'Templates',
      schema: '../../src-docs/json/features/templates.json'
    },
    'options-overrides': {
      name: 'Options Overrides',
      schema: '../../src-docs/json/features/options-overrides.json'
    },
    'edit-json-data': {
      name: 'Edit JSON Data',
      schema: '../../src-docs/json/features/edit-json-data.json'
    }
  }
}

function JedisonDemo() {
  const [selectedExample, setSelectedExample] = useState('custom')
  const [jsonOutput, setJsonOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [hiddenInputValue, setHiddenInputValue] = useState('No form data yet')
  const [buildId, setBuildId] = useState('')

  const jedisonContainerRef = useRef(null)
  const jedisonInstanceRef = useRef(null)

  // Initialize or reload Jedison when example changes
  useEffect(() => {
    loadExample(selectedExample)

    // Cleanup on unmount
    return () => {
      if (jedisonInstanceRef.current) {
        jedisonInstanceRef.current.destroy()
        jedisonInstanceRef.current = null
      }
    }
  }, [selectedExample])

  const loadExample = async (exampleKey) => {
    // Find the example in the catalog
    let schemaPath = null
    for (const category of Object.values(EXAMPLES)) {
      if (category[exampleKey]) {
        schemaPath = category[exampleKey].schema
        break
      }
    }

    if (!schemaPath) return

    try {
      // Fetch the schema
      const response = await fetch(schemaPath)
      const schema = await response.json()

      // Destroy existing instance
      if (jedisonInstanceRef.current) {
        jedisonInstanceRef.current.destroy()
      }

      // Create new Jedison instance
      jedisonInstanceRef.current = new Jedison.Create({
        container: jedisonContainerRef.current,
        schema: schema,
        theme: new ThemeMui(),
        customEditors: [
          ReactMuiEditors.ReactMuiTextField,
          ReactMuiEditors.ReactMuiSelect,
          ReactMuiEditors.ReactMuiCheckbox,
          ReactMuiEditors.ReactMuiSwitch
        ]
      })

      // Listen for changes and update hidden input display
      jedisonInstanceRef.current.on('change', () => {
        updateHiddenInputDisplay()
      })

      // Set build ID
      setBuildId(jedisonInstanceRef.current.buildId)

      // Initial display
      updateHiddenInputDisplay()
    } catch (error) {
      console.error('Error loading schema:', error)
      jedisonContainerRef.current.innerHTML =
        '<p style="color: red;">Error loading schema. Please check the console.</p>'
    }
  }

  const updateHiddenInputDisplay = () => {
    if (jedisonInstanceRef.current) {
      const value = jedisonInstanceRef.current.getValue()
      setHiddenInputValue(JSON.stringify(value, null, 2))
    }
  }

  const handleShowJSON = () => {
    if (jedisonInstanceRef.current) {
      const value = jedisonInstanceRef.current.getValue()
      setJsonOutput(JSON.stringify(value, null, 2))
      setShowOutput(true)
    }
  }

  const handleReset = () => {
    if (jedisonInstanceRef.current) {
      jedisonInstanceRef.current.setValue({})
      setShowOutput(false)
    }
  }

  return React.createElement('div', { className: 'container' },
    // Build ID badge (top right)
    buildId && React.createElement('div', {
      style: {
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '4px 8px',
        background: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#666',
        zIndex: 9999
      }
    }, `build: ${buildId}`),

    // Title
    React.createElement('h1', null, 'Jedison + React + Material-UI Demo'),

    // Info box
    React.createElement('div', { className: 'info' },
      React.createElement('strong', null, 'What this demonstrates:'),
      React.createElement('br'),
      'This demo shows how to create custom Jedison editors using React and Material-UI components. ',
      'All form values are automatically synchronized to a hidden input containing the complete JSON. ',
      'The custom editors use Jedison\'s new lifecycle hooks, value sync helpers, and cleanup system.'
    ),

    // Example selector
    React.createElement('div', { style: { marginBottom: '20px' } },
      React.createElement('label', {
        htmlFor: 'examples',
        style: { display: 'block', marginBottom: '8px', fontWeight: '500' }
      }, 'Examples:'),
      React.createElement('select', {
        id: 'examples',
        value: selectedExample,
        onChange: (e) => setSelectedExample(e.target.value),
        style: {
          padding: '8px 12px',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '500px'
        }
      },
        // Render optgroups and options
        ...Object.entries(EXAMPLES).map(([category, examples]) =>
          React.createElement('optgroup', { key: category, label: category },
            ...Object.entries(examples).map(([key, { name }]) =>
              React.createElement('option', { key: key, value: key }, name)
            )
          )
        )
      )
    ),

    // Jedison form container
    React.createElement('div', { ref: jedisonContainerRef, id: 'jedison-form' }),

    // Action buttons
    React.createElement('div', { className: 'actions' },
      React.createElement('button', { onClick: handleShowJSON }, 'Show JSON Value'),
      React.createElement('button', { className: 'secondary', onClick: handleReset }, 'Reset Form')
    ),

    // Hidden input display
    React.createElement('div', { className: 'hidden-input-display' },
      React.createElement('h3', null, 'Hidden Input (contains complete JSON):'),
      React.createElement('p', null,
        'Jedison automatically maintains this hidden input with the complete form data. ',
        'This is how form submissions work.'
      ),
      React.createElement('pre', { id: 'hidden-input-value' }, hiddenInputValue)
    ),

    // Output display (shown when "Show JSON Value" is clicked)
    showOutput && React.createElement('div', { id: 'output', className: 'output' },
      React.createElement('h3', null, 'Current JSON Value:'),
      React.createElement('pre', { id: 'json-output' }, jsonOutput)
    )
  )
}

// Export for use in index.html
window.JedisonDemo = JedisonDemo
