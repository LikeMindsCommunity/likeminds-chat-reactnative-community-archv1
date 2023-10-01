import {SyncChatroomRequest} from 'reactnative-chat-data';
import {myClient} from '../../';

// Sync Chatrrom API
async function syncChatroomAPI(
  page: number,
  minTimeStamp: number,
  maxTimeStamp: number,
  isDm: boolean,
) {
  const chatroomTypes = isDm ? [10] : [0, 7];
  const res = await myClient?.syncChatroom(
    SyncChatroomRequest.builder()
      .setPage(page)
      .setPageSize(50)
      .setChatroomTypes(chatroomTypes)
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
  isDm: boolean,
) => {
  const timeStampStored = await myClient?.getTimeStamp();
  console.log('timeStampStored', timeStampStored);

  let maxTimeStampNow = Math.floor(Date.now());

  // Taking minTimeStamp as 0 for the first time else last maxTimeStamp will become current minTimeStamp
  let minTimeStampNow =
    timeStampStored[0].minTimeStamp === 0 ? 0 : timeStampStored[0].maxTimeStamp;

  console.log('minTimeStampNow', minTimeStampNow);
  console.log('maxTimeStampNow', maxTimeStampNow);

  const val = await syncChatroomAPI(
    page,
    minTimeStampNow,
    maxTimeStampNow,
    isDm,
  );

  const DB_RESPONSE = val?.data;

  if (page === INITIAL_SYNC_PAGE && DB_RESPONSE?.chatroomsData.length !== 0) {
    await myClient?.saveCommunity(
      DB_RESPONSE?.communityMeta[user?.sdkClientInfo?.community],
    );
  }

  if (DB_RESPONSE?.chatroomsData.length !== 0) {
    myClient?.saveChatroomResponse(
      DB_RESPONSE,
      DB_RESPONSE?.chatroomsData,
      user?.sdkClientInfo?.community,
    );
  }
  await myClient.updateTimeStamp(
    maxTimeStampNow,
    Math.floor(Date.now() / 1000),
  );

  if (DB_RESPONSE?.chatroomsData?.length === 0) {
    return;
  } else {
    await paginatedSyncAPI(page + 1, user?.sdkClientInfo?.community, isDm);
  }
};
