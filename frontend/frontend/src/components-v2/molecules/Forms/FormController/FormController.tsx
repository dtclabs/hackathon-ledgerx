import { yupResolver } from '@hookform/resolvers/yup'
import React, { ReactNode, useMemo, ReactElement } from 'react'
import { useForm, RegisterOptions, SubmitHandler, Controller, FormProvider } from 'react-hook-form'

type IFormControllerProps<T> = {
  children: ReactNode
  onSubmit?: SubmitHandler<T>
  validationSchema?: any
  id?: string
}

const FormController = <T extends Record<string, any>>({
  children,
  onSubmit,
  validationSchema
}: IFormControllerProps<T>) => {
  const { control, handleSubmit, formState } = useForm({
    resolver: yupResolver(validationSchema),
    reValidateMode: 'onChange'
  })
  console.log('FORM STATE: ', formState.errors)

  // const recursivelyInjectProps = (element: any) => {
  //   if (!React.isValidElement(element)) {
  //     return element
  //   }

  // const {
  //   // @ts-ignore
  //   props: { children: nestedChild, ...otherProps }
  // } = element

  // if (element.type.displayName === 'FormGroup') {
  //   return React.cloneElement(
  //     element,
  //     { ...otherProps, error: formState.errors[otherProps.id]?.message ?? '' },
  //     React.Children.map(nestedChild, (child) => recursivelyInjectProps(child as ReactElement<any>))
  //   )
  // }
  // @ts-ignore
  //   if (element.type.displayName === 'TextInput') {
  //     return (
  //       <Controller
  //         name={element?.props?.id}
  //         control={control}
  //         defaultValue={element.props.defaultValue || ''}
  //         render={({ field }) =>
  //           React.cloneElement(element, {
  //             ...field,
  //             ...element.props,
  //             onChange: (e) => {
  //               field.onChange(e)
  //               if (element.props.onChange) {
  //                 element.props.onChange(e)
  //               }
  //             },
  //             onBlur: (e) => {
  //               field.onBlur(e)
  //               if (element.props.onBlur) {
  //                 element.props.onBlur(e)
  //               }
  //             }
  //           })
  //         }
  //       />
  //     )
  //   }

  //   if (React.Children.count(nestedChild) > 0) {
  //     return React.cloneElement(
  //       element,
  //       { ...otherProps },
  //       React.Children.map(nestedChild, (child) => recursivelyInjectProps(child as ReactElement<any>))
  //     )
  //   }

  //   return element
  // }

  // const parsedChildren = useMemo(
  //   () => React.Children.map(children, (child) => recursivelyInjectProps(child as ReactElement<any>)),
  //   [children, formState.errors]
  // )

  return (
    <form>
       {children}
      <button type="submit" className="mt-4">
        Submit
      </button>{' '}
    </form>
  )
}

export default FormController
