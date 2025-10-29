/**
 * TypeScript definitions for Jedison custom editor development
 * These types help with creating custom editors that integrate with React, Vue, Svelte, etc.
 */

export interface EditorConfig {
  instance: any;
  theme: any;
  [key: string]: any;
}

/**
 * Lifecycle hooks for custom editors
 * These are optional methods that can be implemented for framework integration
 */
export interface EditorLifecycleHooks {
  /**
   * Called before build() method
   * Use for pre-build setup, framework initialization
   */
  beforeBuild?(): void;

  /**
   * Called after build() method
   * Use for post-build operations, mounting framework components
   */
  afterBuild?(): void;

  /**
   * Called before destroy() cleanup
   * Use for pre-cleanup operations
   */
  beforeDestroy?(): void;

  /**
   * Called after destroy() cleanup
   * Use for final cleanup operations
   */
  afterDestroy?(): void;
}

/**
 * Base Editor class for creating custom editors
 * Extend this class to create editors that integrate with UI frameworks
 */
export abstract class Editor implements EditorLifecycleHooks {
  instance: any;
  theme: any;
  control: any;
  containerElement?: HTMLElement;
  cleanupCallbacks: Array<() => void>;
  disabled: boolean;
  readOnly: boolean;

  constructor(instance: any);

  /**
   * Main build method - creates the editor UI
   * Override this method in custom editors
   */
  abstract build(): void;

  /**
   * Sync value from framework component to Jedison
   * Call this when your React/Vue/Svelte component value changes
   * @param value - The value from the framework component
   */
  syncValueToJedison(value: any): void;

  /**
   * Get current value from Jedison
   * Use this to read the current Jedison value in your framework component
   * @returns Current instance value
   */
  syncValueFromJedison(): any;

  /**
   * Register cleanup callback for framework instances
   * Use this to clean up React roots, Vue apps, Svelte components, etc.
   * @param callback - Cleanup function to call when editor is destroyed
   * @example
   * ```typescript
   * // React example
   * this.registerCleanup(() => {
   *   if (this.reactRoot) {
   *     this.reactRoot.unmount();
   *     this.reactRoot = null;
   *   }
   * });
   * ```
   */
  registerCleanup(callback: () => void): void;

  /**
   * Cleanup and destroy editor
   * Automatically calls beforeDestroy hook, cleanup callbacks, and afterDestroy hook
   */
  destroy(): void;

  /**
   * Disable the editor
   */
  disable(): void;

  /**
   * Enable the editor
   */
  enable(): void;

  /**
   * Refresh the editor UI
   */
  refreshUI(): void;

  /**
   * Show validation errors
   * @param errors - Array of validation errors
   * @param force - Force showing errors even if showErrors is 'never'
   */
  showValidationErrors(errors: any[], force?: boolean): void;

  // Lifecycle hooks (optional - implement these in your custom editor)
  beforeBuild?(): void;
  afterBuild?(): void;
  beforeDestroy?(): void;
  afterDestroy?(): void;
}

/**
 * Interface for custom editor classes
 * Your custom editor class should implement this interface
 */
export interface CustomEditorClass {
  /**
   * Determines if this editor should be used for the given schema
   * @param schema - JSON Schema object
   * @param refParser - Optional reference parser
   * @returns true if this editor should handle the schema
   * @example
   * ```typescript
   * static resolves(schema: any): boolean {
   *   return schema['x-editor'] === 'react-mui-textfield';
   * }
   * ```
   */
  resolves(schema: any, refParser?: any): boolean;

  new(instance: any): Editor;
}
