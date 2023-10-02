export function removeDuplicateObjects<T>(arr: T[]): T[] {
  const uniqueObjects: T[] = [];

  // Helper function to check if an object exists in the uniqueObjects array
  function isObjectUnique(obj: T): boolean {
    const stringifiedObj = JSON.stringify(obj);
    return !uniqueObjects.some(
      existingObj => JSON.stringify(existingObj) === stringifiedObj,
    );
  }

  // Filter the array to keep only unique objects
  arr.forEach(obj => {
    if (isObjectUnique(obj)) {
      uniqueObjects.push(obj);
    }
  });

  return uniqueObjects;
}
