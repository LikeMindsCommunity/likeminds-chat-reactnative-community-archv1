import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {myClient} from '../..';
import {StackActions} from '@react-navigation/native';
import {SHOW_TOAST} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../store';
import CommonAllMembers from '../../components/CommonAllMembers';

const DmAllMembers = ({navigation, route}: any) => {
  return <CommonAllMembers navigation={navigation} isDM={true} />;
};

export default DmAllMembers;
