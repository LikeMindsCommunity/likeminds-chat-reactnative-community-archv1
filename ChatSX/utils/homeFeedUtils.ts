export function removeDuplicates(arr: any) {
  const uniqueObjects = new Set<string>(); // Use a Set to track unique objects
  const result = [];

  for (const obj of arr) {
    // Convert the object to a string for easy comparison
    const objString = JSON.stringify(obj);

    if (!uniqueObjects.has(objString)) {
      // If the object hasn't been seen before, add it to the result
      result.push(obj);
      uniqueObjects.add(objString); // Add the string representation to the Set
    }
  }

  return result;
}

// To sort the HomeFeed and DMFeed chatrooms based on updatedAt key
export function sortChatrooms(chatroom: any) {
  chatroom.sort(function (a: any, b: any) {
    let keyA = a.updatedAt;
    let keyB = b.updatedAt;
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
  return chatroom;
}
