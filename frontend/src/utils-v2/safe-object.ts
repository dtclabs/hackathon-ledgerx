/* eslint-disable no-useless-constructor */
class SafeObject<T extends object> {
  constructor(private obj: { [key in keyof T]: T[key] }, private defaultMessage = 'Property does not exist') {}

  get<K extends keyof T>(prop: K): T[K] | string {
    if (Reflect.has(this.obj, prop)) {
      return Reflect.get(this.obj, prop) as T[K]
    }
    return this.defaultMessage
  }
}

export default SafeObject

/* Example
  const SOME_MAP_WRAPPER = new SafeObjectWrapper({
    created: "created",
    success: "success",
  }, "This will be the default message if the property does not exist");

  SOME_MAP_WRAPPER.get("created"); // "created" 
*/
