import React from 'react';
import CommonAllMembers from '../../components/CommonAllMembers';

const AddParticipants = ({navigation, route}: any) => {
  const {chatroomID, chatroomName} = route.params;
  return (
    <CommonAllMembers
      navigation={navigation}
      isDM={false}
      chatroomID={chatroomID}
      chatroomName={chatroomName}
    />
  );
};

export default AddParticipants;
