import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {styles} from './styles';

interface Props {
  newCount: number;
  navigation: any;
}

const HomeFeedExplore: React.FC<Props> = ({newCount = 5, navigation}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('ExploreFeed');
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
        {newCount > 0 && (
          <View style={styles.newCountContainer}>
            <Text style={styles.newCount}>{`${newCount} NEW`}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default HomeFeedExplore;
