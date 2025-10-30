import {
  buildMessage,
  registerDecorator,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import Decimal from 'decimal.js'

@ValidatorConstraint({ async: false })
export class CannotUseWith implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any
    return args.constraints.every((propertyName) => {
      return object[propertyName] === undefined
    })
  }

  defaultMessage(args: ValidationArguments) {
    return `Cannot be used with \`${args.constraints.join('` , `')}\`.`
  }
}

export function MinDecimal(minValue: number, validationOptions?: ValidationOptions): PropertyDecorator {
  function min(num: unknown, min: number): boolean {
    return num instanceof Decimal && typeof min === 'number' && num.greaterThanOrEqualTo(min)
  }

  return ValidateBy(
    {
      name: 'MIN_DECIMAL',
      constraints: [minValue],
      validator: {
        validate: (value, args): boolean => min(value, args?.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be greater than $constraint1',
          validationOptions
        )
      }
    },
    validationOptions
  )
}

@ValidatorConstraint({ async: false })
export class MustUseWith implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (value === undefined) return true

    const object = args.object as any
    return args.constraints.every((propertyName) => {
      return !!object[propertyName]
    })
  }

  defaultMessage(args: ValidationArguments) {
    return `Must be used with \`${args.constraints.join('` , `')}\`.`
  }
}

export function IsLaterThanOrEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsLaterThanOrEqual',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]
          return (
            typeof value === 'string' && typeof relatedValue === 'string' && new Date(value) >= new Date(relatedValue)
          )
        },
        defaultMessage(args: ValidationArguments) {
          return `${propertyName} must be later than ${args.constraints[0]}`
        }
      }
    })
  }
}
