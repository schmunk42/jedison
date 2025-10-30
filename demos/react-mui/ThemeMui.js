/**
 * Minimal MUI Theme for React MUI Demo
 * Extends the base Jedison Theme to add MUI-standard spacing (16px between fields)
 */

/* global Jedison */

class ThemeMui extends Jedison.Theme {
  /**
   * Override getInputControl to add bottom margin
   */
  getInputControl (config) {
    const control = super.getInputControl(config)
    control.container.style.marginBottom = '16px'
    return control
  }

  /**
   * Override getSelectControl to add bottom margin
   */
  getSelectControl (config) {
    const control = super.getSelectControl(config)
    control.container.style.marginBottom = '16px'
    return control
  }

  /**
   * Override getCheckboxControl to add bottom margin
   */
  getCheckboxControl (config) {
    const control = super.getCheckboxControl(config)
    control.container.style.marginBottom = '16px'
    return control
  }

  /**
   * Override getObjectControl to add bottom margin to nested objects
   */
  getObjectControl (config) {
    const control = super.getObjectControl(config)
    control.container.style.marginBottom = '16px'
    return control
  }

  /**
   * Override getTextareaControl to add bottom margin
   */
  getTextareaControl (config) {
    const control = super.getTextareaControl(config)
    control.container.style.marginBottom = '16px'
    return control
  }
}

// Export for use in index.html
window.ThemeMui = ThemeMui
