import {SyncChatroomRequest} from 'reactnative-chat-data';
import {myClient} from '../../';

// Sync Chatrrom API
async function syncChatroomAPI(
  page: number,
  minTimeStamp: number,
  maxTimeStamp: number,
  isDmFeed: boolean,
) {
  const chatroomType = isDmFeed ? [10] : [0, 7];

  const res = await myClient?.syncChatroom(
    SyncChatroomRequest.builder()
      .setPage(page)
      .setPageSize(50)
      .setChatroomTypes(chatroomType)
      .setMaxTimestamp(maxTimeStamp)
      .setMinTimestamp(minTimeStamp)
      .build(),
  );
  return res;
}

const INITIAL_SYNC_PAGE = 1;

// Pagination call for sync chatroom
export const paginatedSyncAPI = async (
  page: number,
  user: any,
  isDmFeed: boolean,
) => {
  const timeStampStored = await myClient?.getTimeStamp();
  const temp = JSON.stringify(timeStampStored);
  let parsedTimeStamp = JSON.parse(temp);
  let maxTimeStampNow = Math.floor(Date.now() / 1000);

  // Taking minTimeStamp as 0 for the first time else last maxTimeStamp will become current minTimeStamp
  let minTimeStampNow =
    parsedTimeStamp[0].minTimeStamp === 0 ? 0 : parsedTimeStamp[0].maxTimeStamp;

  const val = await syncChatroomAPI(
    page,
    minTimeStampNow,
    maxTimeStampNow,
    isDmFeed,
  );

  const DB_RESPONSE = val?.data;

  if (page === INITIAL_SYNC_PAGE && DB_RESPONSE?.chatroomsData.length !== 0) {
    await myClient?.saveCommunity(
      DB_RESPONSE?.communityMeta[user?.sdkClientInfo?.community],
    );
  }

  if (DB_RESPONSE?.chatroomsData.length !== 0 && isDmFeed) {
    const totalChatrooms = DB_RESPONSE?.chatroomsData;

    const chatroom = totalChatrooms[0];
    const userData =
      user?.id !== chatroom?.chatroomWithUserId
        ? DB_RESPONSE?.userMeta[chatroom?.chatroomWithUserId]?.name
        : DB_RESPONSE?.userMeta[chatroom?.userId]?.name;

    DB_RESPONSE.chatroomsData[0].chatroomWithUserName = userData;
  }

  if (DB_RESPONSE?.chatroomsData.length !== 0) {
    await myClient?.saveChatroomResponse(
      DB_RESPONSE,
      DB_RESPONSE?.chatroomsData,
      user?.sdkClientInfo?.community,
    );
  }

  myClient?.updateTimeStamp(parsedTimeStamp[0].maxTimeStamp, maxTimeStampNow);

  if (DB_RESPONSE?.chatroomsData?.length === 0) {
    return;
  } else {
    await paginatedSyncAPI(page + 1, user?.sdkClientInfo?.community, isDmFeed);
  }
};
