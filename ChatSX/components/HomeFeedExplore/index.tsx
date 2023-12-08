import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {styles} from './styles';
import {EXPLORE_FEED} from '../../constants/Screens';

interface Props {
  newCount: number;
  navigation: any;
  totalCount: number;
}

const HomeFeedExplore: React.FC<Props> = ({
  newCount,
  totalCount,
  navigation,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(EXPLORE_FEED);
      }}
      style={styles.itemContainer}>
      <Image
        source={require('../../assets/images/explore_icon3x.png')}
        style={styles.icon}
      />
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.title}>Explore Chatrooms</Text>
        </View>
        {newCount > 0 ? (
          <View style={styles.newCountContainer}>
            <Text style={styles.newCount}>{`${newCount} NEW`}</Text>
          </View>
        ) : (
          <View>
            {totalCount ? (
              <View style={styles.newCountContainer}>
                <Text style={styles.newCount}>
                  {totalCount > 1
                    ? `${totalCount} CHATROOMS`
                    : `${totalCount} CHATROOM`}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default HomeFeedExplore;
