//dummmy keys to bypass typescript waring
export function dummyKeys(RO: any) {
  return {
    keys: () => [""],
    entries: () => [],
    isValid: () => false,
    objectSchema: () => RO.schema,
    addListener: () => {},
    removeListener: () => {},
    getPropertyType: () => "",
    removeAllListeners: () => {},
    _objectKey: () => "",
    linkingObjectsCount: () => 0,
    linkingObjects: (objectType: string, property: string) => {
      return {} as any;
    },
    toJSON: () => {
      return {};
    },
  };
}
