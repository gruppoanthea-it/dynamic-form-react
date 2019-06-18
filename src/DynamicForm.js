// @flow

import * as React from 'react'
import { Field, Formik } from 'formik'

type FieldConfig = any

export type Props = {
  component: React.Component<any>,
  className?: string,
  rootProps: any,
  formProps: any,
  onSubmit: (values: any) => void,
  schema: Array<FieldConfig>,
  fieldComponent: (field: FieldConfig) => React.Component<any>,
  fieldClassName: (field: FieldConfig) => string,
  fieldLabel: (field: FieldConfig) => string,
  fieldValidation: (field: FieldConfig) => (errors: any, values: any) => void,
  initialValues: any,
  actions: (props: any) => React.Node,
}

const DynamicForm = (props: Props) => {
  const {
    component: Component,
    className,
    rootProps,
    formProps,
    onSubmit,
    schema,
    fieldComponent,
    fieldClassName,
    fieldLabel,
    fieldValidation,
    initialValues: initialValuesProp,
    actions
  } = props
  const schemaNames = schema.map(field => (field.name))

  const initialValues = { ...initialValuesProp }
  for (const name of schemaNames) {
    initialValues[name] = initialValues[name] || ''
  }

  const validations = schema.map(field =>
    fieldValidation(field)
  )

  function validate (values) {
    const errors = {}
    validations.forEach(validate => {
      try {
        validate(errors, values)
      } catch (e) {
        console.error(e)
      }
    })
    return errors
  }

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={validate}
      render={(props: any) => (
        <React.Fragment>
          <Component
            className={className}
            {...rootProps}
          >
            <form onSubmit={props.handleSubmit} {...formProps}>
              {schema.map(field => {
                const { name, type, label: _, value, validations, styles, ...other } = field
                const FieldComponent = fieldComponent(field)
                const className = fieldClassName(field)
                const label = fieldLabel(field)

                if (field.name) {
                  return (
                    <div
                      key={name}
                      className={className}
                    >
                      <Field
                        name={name}
                        label={label}
                        {...other}
                        component={FieldComponent}
                      />
                    </div>
                  )
                }

                return <FieldComponent />
              })}
            </form>
          </Component>
          {actions(props)}
        </React.Fragment>
      )}
    />
  )
}

DynamicForm.defaultProps = {
  component: 'div',
  actions: () => false,
}

export default DynamicForm
