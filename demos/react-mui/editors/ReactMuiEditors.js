/**
 * Custom Jedison Editors using React and Material-UI (MUI)
 * These editors demonstrate how to integrate React components with Jedison
 */

/* global React, ReactDOM, MaterialUI, Jedison */

const { TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Switch } = MaterialUI

/**
 * MUI TextField Editor for string types
 */
class ReactMuiTextField extends Jedison.Editor {
  static resolves(schema) {
    return schema.type === 'string' && (!schema['x-editor'] || schema['x-editor'] === 'react-mui-textfield')
  }

  build() {
    // Create a simple container structure (no Bootstrap theme needed)
    this.control = {
      container: document.createElement('div'),
      input: document.createElement('div')
    }

    this.control.container.appendChild(this.control.input)

    // Create container for React component
    this.containerElement = document.createElement('div')
    this.control.input.appendChild(this.containerElement)

    // Create React root
    this.reactRoot = ReactDOM.createRoot(this.containerElement)

    // Initial render
    this.renderComponent()

    // Register cleanup for React root
    this.registerCleanup(() => {
      if (this.reactRoot) {
        this.reactRoot.unmount()
        this.reactRoot = null
      }
    })
  }

  renderComponent() {
    const value = this.syncValueFromJedison() || ''
    const title = this.getTitle()

    this.reactRoot.render(
      React.createElement(TextField, {
        value: value,
        onChange: (e) => this.syncValueToJedison(e.target.value),
        label: title,
        disabled: this.disabled || this.readOnly,
        error: this.showingValidationErrors,
        fullWidth: true,
        variant: 'outlined',
        size: 'small'
      })
    )
  }

  // Re-render when Jedison value changes externally
  refreshUI() {
    super.refreshUI()
    if (this.reactRoot) {
      this.renderComponent()
    }
  }
}

/**
 * MUI Select Editor for enum/options
 */
class ReactMuiSelect extends Jedison.Editor {
  static resolves(schema) {
    return schema.enum && (!schema['x-editor'] || schema['x-editor'] === 'react-mui-select')
  }

  build() {
    // Create a simple container structure (no Bootstrap theme needed)
    this.control = {
      container: document.createElement('div'),
      input: document.createElement('div')
    }

    this.control.container.appendChild(this.control.input)

    this.containerElement = document.createElement('div')
    this.control.input.appendChild(this.containerElement)

    this.reactRoot = ReactDOM.createRoot(this.containerElement)
    this.renderComponent()

    this.registerCleanup(() => {
      if (this.reactRoot) {
        this.reactRoot.unmount()
        this.reactRoot = null
      }
    })
  }

  renderComponent() {
    const value = this.syncValueFromJedison() || ''
    const options = this.instance.schema.enum || []
    const title = this.getTitle()

    this.reactRoot.render(
      React.createElement(FormControl, {
        fullWidth: true,
        error: this.showingValidationErrors,
        size: 'small',
        variant: 'outlined'
      },
        React.createElement(InputLabel, null, title),
        React.createElement(Select, {
          value: value,
          onChange: (e) => this.syncValueToJedison(e.target.value),
          label: title,
          disabled: this.disabled || this.readOnly
        },
          options.map((option) =>
            React.createElement(MenuItem, {
              key: option,
              value: option
            }, option)
          )
        )
      )
    )
  }

  refreshUI() {
    super.refreshUI()
    if (this.reactRoot) {
      this.renderComponent()
    }
  }
}

/**
 * MUI Checkbox Editor for boolean types
 */
class ReactMuiCheckbox extends Jedison.Editor {
  static resolves(schema) {
    return schema.type === 'boolean' && schema['x-editor'] !== 'react-mui-switch' && (!schema['x-editor'] || schema['x-editor'] === 'react-mui-checkbox')
  }

  build() {
    // Create a simple container structure (no Bootstrap theme needed)
    this.control = {
      container: document.createElement('div'),
      input: document.createElement('div')
    }

    this.control.container.appendChild(this.control.input)

    this.containerElement = document.createElement('div')
    this.control.input.appendChild(this.containerElement)

    this.reactRoot = ReactDOM.createRoot(this.containerElement)
    this.renderComponent()

    this.registerCleanup(() => {
      if (this.reactRoot) {
        this.reactRoot.unmount()
        this.reactRoot = null
      }
    })
  }

  renderComponent() {
    const value = this.syncValueFromJedison() || false
    const title = this.getTitle()

    this.reactRoot.render(
      React.createElement(FormControlLabel, {
        control: React.createElement(Checkbox, {
          checked: value,
          onChange: (e) => this.syncValueToJedison(e.target.checked),
          disabled: this.disabled || this.readOnly
        }),
        label: title
      })
    )
  }

  refreshUI() {
    super.refreshUI()
    if (this.reactRoot) {
      this.renderComponent()
    }
  }
}

/**
 * MUI Switch Editor for boolean types (alternative to Checkbox)
 */
class ReactMuiSwitch extends Jedison.Editor {
  static resolves(schema) {
    return schema.type === 'boolean' && schema['x-editor'] === 'react-mui-switch'
  }

  build() {
    // Create a simple container structure (no Bootstrap theme needed)
    this.control = {
      container: document.createElement('div'),
      input: document.createElement('div')
    }

    this.control.container.appendChild(this.control.input)

    this.containerElement = document.createElement('div')
    this.control.input.appendChild(this.containerElement)

    this.reactRoot = ReactDOM.createRoot(this.containerElement)
    this.renderComponent()

    this.registerCleanup(() => {
      if (this.reactRoot) {
        this.reactRoot.unmount()
        this.reactRoot = null
      }
    })
  }

  renderComponent() {
    const value = this.syncValueFromJedison() || false
    const title = this.getTitle()

    this.reactRoot.render(
      React.createElement(FormControlLabel, {
        control: React.createElement(Switch, {
          checked: value,
          onChange: (e) => this.syncValueToJedison(e.target.checked),
          disabled: this.disabled || this.readOnly
        }),
        label: title
      })
    )
  }

  refreshUI() {
    super.refreshUI()
    if (this.reactRoot) {
      this.renderComponent()
    }
  }
}

// Export editors (for use in HTML via window object)
window.ReactMuiEditors = {
  ReactMuiTextField,
  ReactMuiSelect,
  ReactMuiCheckbox,
  ReactMuiSwitch
}
