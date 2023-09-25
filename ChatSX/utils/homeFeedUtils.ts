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
