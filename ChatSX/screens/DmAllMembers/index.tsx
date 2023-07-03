import React from 'react';
import CommonAllMembers from '../../components/CommonAllMembers';

const DmAllMembers = ({navigation, route}: any) => {
  const {showList} = route?.params;
  return (
    <CommonAllMembers navigation={navigation} isDM={true} showList={showList} />
  );
};

export default DmAllMembers;
