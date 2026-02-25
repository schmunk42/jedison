import Instance from './instance.js'
import EditorIfThenElse from '../editors/if-then-else.js'
import Jedison from '../jedison.js'

import {
  isSet,
  mergeDeep,
  clone,
  isObject,
  overwriteExistingProperties,
  hasOwn
} from '../helpers/utils.js'

import {
  getSchemaElse,
  getSchemaIf,
  getSchemaThen
} from '../helpers/schema.js'

/**
 * Represents a InstanceIfThenElse instance.
 * @extends Instance
 */
class InstanceIfThenElse extends Instance {
  setUI () {
    this.ui = new EditorIfThenElse(this)
  }

  prepare () {
    this.instances = []
    this.instanceStartingValues = []
    this.instanceWithoutIf = null
    this.activeInstance = null
    this.index = 0
    this.schemas = []
    this.ifThenElseSchemas = []

    this._changingValue = false
    this._fittestCache = { key: undefined, index: undefined }
    this.traverseSchema(this.schema)

    delete this.schema.if
    delete this.schema.then
    delete this.schema.else

    this.ifThenElseSchemas.forEach((item) => {
      if (isSet(item.then)) {
        this.schemas.push(mergeDeep({}, clone(this.schema), item.then))
      }

      if (isSet(item.else)) {
        this.schemas.push(mergeDeep({}, clone(this.schema), item.else))
      }
    })

    const schemaClone = clone(this.schema)
    delete schemaClone.if
    delete schemaClone.then
    delete schemaClone.else

    this.instanceWithoutIf = this.jedison.createInstance({
      jedison: this.jedison,
      schema: schemaClone,
      originalSchema: this.originalSchema,
      path: this.path,
      parent: this.parent,
      arrayTemplateData: this.arrayTemplateData
    })

    this.schemas.forEach((schema) => {
      const instance = this.jedison.createInstance({
        jedison: this.jedison,
        schema: schema,
        originalSchema: this.originalSchema,
        path: this.path,
        parent: this.parent,
        arrayTemplateData: this.arrayTemplateData
      })

      this.instanceStartingValues.push(instance.getValue())

      this.instances.push(instance)
    })

    this.on('set-value', (value, initiator) => {
      this.changeValue(value, initiator)
    })

    const ifValue = this.instanceWithoutIf.getValue()
    this.changeValue(ifValue)
  }

  changeValue (value, initiator = 'api') {
    if (this._changingValue) return
    this._changingValue = true
    try {
      const withoutIf = this.getWithoutIfValueFromValue(value)
      const fittestIndex = this.getFittestIndex(withoutIf)
      const indexChanged = fittestIndex !== this.index
      this.index = fittestIndex
      this.activeInstance = this.instances[fittestIndex]
      this.activeInstance.register()

      this.instances.forEach((instance, index) => {
        instance.off('notifyParent')

        const isActive = index === fittestIndex

        // Only update Multiple children on the active instance
        if (isActive && instance.children && isObject(value)) {
          instance.children.forEach((child) => {
            const shouldUpdateValue = child.isMultiple && hasOwn(value, child.getKey())

            if (shouldUpdateValue) {
              child.setValue(value[child.getKey()], true, 'api')
            }
          })
        }

        // Only call setValue on the active instance, or on all instances
        // when the index just changed (to sync the newly-active branch)
        if (isActive || indexChanged) {
          const startingValue = this.instanceStartingValues[index]
          const currentValue = instance.getValue()
          let instanceValue = value

          if (isObject(startingValue) && isObject(value)) {
            if (indexChanged) {
              instanceValue = overwriteExistingProperties(startingValue, withoutIf)
              this.jedison.updateInstancesWatchedData()
            } else {
              instanceValue = overwriteExistingProperties(currentValue, value)
            }

            if (initiator === 'api') {
              instanceValue = overwriteExistingProperties(currentValue, value)
            }
          }

          instance.setValue(instanceValue, false, initiator)
        }

        // notifyParent handler is needed on ALL instances (for branch switching)
        instance.on('notifyParent', (initiator) => {
          const value = instance.getValue()
          this.changeValue(value, initiator)
          this.emit('notifyParent', initiator)
          this.emit('change', initiator)
        })
      })

      // Ensure active instance processes the value again for nullable editors
      // Only apply secondary setValue if we have nullable fields that might need it
      if (initiator === 'api' && this.hasNullableFields(this.activeInstance)) {
        this.activeInstance.setValue(value, false, 'secondary')
      }

      this.value = this.activeInstance.getValueRaw()
    } finally {
      this._changingValue = false
    }
  }

  getWithoutIfValueFromValue (value) {
    let withoutIf = this.instanceWithoutIf.getValue()

    if (isObject(withoutIf) && isObject(value)) {
      withoutIf = overwriteExistingProperties(withoutIf, value)
      return withoutIf
    }

    return value
  }

  traverseSchema (schema) {
    const schemaIf = getSchemaIf(schema)

    if (isSet(schemaIf)) {
      const schemaThen = getSchemaThen(schema)
      const schemaElse = getSchemaElse(schema)

      this.ifThenElseSchemas.push({
        if: schemaIf,
        then: isSet(schemaThen) ? schemaThen : {}
      })

      this.ifThenElseSchemas.push({
        if: schemaIf,
        else: isSet(schemaElse) ? schemaElse : {}
      })
    }
  }

  /**
   * Check if an instance has nullable fields in its schema or children
   */
  hasNullableFields (instance) {
    if (!instance) return false

    // Check if the instance itself has a nullable schema
    if (this.isNullableSchema(instance.schema)) {
      return true
    }

    // Check if any child instances have nullable schemas
    if (instance.children) {
      return instance.children.some(child => this.hasNullableFields(child))
    }

    return false
  }

  /**
   * Check if a schema is nullable (has x-format: 'number-nullable' or similar nullable formats)
   */
  isNullableSchema (schema) {
    if (!schema) return false

    // Check for x-format nullable indicators
    if (schema['x-format'] && schema['x-format'].includes('nullable')) {
      return true
    }

    // Check for type array containing null
    if (Array.isArray(schema.type) && schema.type.includes('null')) {
      return true
    }

    // Recursively check properties
    if (schema.properties) {
      return Object.values(schema.properties).some(prop => this.isNullableSchema(prop))
    }

    return false
  }

  /**
   * Returns the index of the instance that has less validation errors.
   * Results are cached based on the discriminator property values from
   * the if-schema so that repeated calls with the same effective input
   * skip the expensive temporary Jedison creation.
   */
  getFittestIndex (value) {
    // Build a cache key from the properties referenced in the if-schema
    let cacheKey
    try {
      if (isObject(value)) {
        const ifProps = this._getIfPropertyNames()
        if (ifProps) {
          const subset = {}
          for (const p of ifProps) {
            if (hasOwn(value, p)) subset[p] = value[p]
          }
          cacheKey = JSON.stringify(subset)
        } else {
          cacheKey = JSON.stringify(value)
        }
      } else {
        cacheKey = JSON.stringify(value)
      }
    } catch {
      cacheKey = undefined
    }

    if (cacheKey !== undefined && cacheKey === this._fittestCache.key) {
      return this._fittestCache.index
    }

    let fittestIndex = this.index

    this.ifThenElseSchemas.forEach((schema, index) => {
      if (schema.if === true) {
        fittestIndex = 0
      } else if (schema.if === false) {
        fittestIndex = 1
      } else {
        const testSchema = clone(schema.if)

        if (isSet(this.schema.type)) {
          testSchema.type = this.schema.type
        }

        const ifValidator = new Jedison({
          schema: testSchema,
          data: value,
          refParser: this.jedison.refParser
        })

        const ifErrors = ifValidator.getErrors()
        ifValidator.destroy()

        if (ifErrors.length === 0 && schema.then) {
          fittestIndex = index
        }

        if (ifErrors.length > 0 && schema.else) {
          fittestIndex = index
        }
      }
    })

    this._fittestCache = { key: cacheKey, index: fittestIndex }
    return fittestIndex
  }

  /**
   * Extracts property names from the if-schema for cache key computation.
   * Returns null if the if-schema structure is too complex to extract keys.
   */
  _getIfPropertyNames () {
    if (!this._ifPropNames) {
      const names = new Set()
      for (const schema of this.ifThenElseSchemas) {
        if (isObject(schema.if) && isObject(schema.if.properties)) {
          for (const key of Object.keys(schema.if.properties)) {
            names.add(key)
          }
        } else if (schema.if !== true && schema.if !== false) {
          // Complex if-schema — fall back to full stringify
          this._ifPropNames = null
          return null
        }
      }
      this._ifPropNames = names.size > 0 ? [...names] : null
    }
    return this._ifPropNames
  }

  hasNestedValidationErrors () {
    return this.activeInstance ? this.activeInstance.hasNestedValidationErrors() : false
  }

  destroy () {
    this.instances.forEach((instance) => {
      instance.destroy()
    })

    super.destroy()
  }
}

export default InstanceIfThenElse
