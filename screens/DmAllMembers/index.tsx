
import React from 'react';
import CommonAllMembers from '../../components/CommonAllMembers';

const DmAllMembers = ({navigation, route}: any) => {
  return <CommonAllMembers navigation={navigation} isDM={true} />;
};

export default DmAllMembers;
