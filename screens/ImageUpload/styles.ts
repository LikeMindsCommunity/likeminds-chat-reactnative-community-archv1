import {Platform, StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';
import Layout from '../../constants/Layout';

const styles = StyleSheet.create({
  page: {flex: 1, flexDirection: 'column', 
  backgroundColor: 'black'
},
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: Platform.OS === 'ios' ? -5 : 0,
  },
  backBtn: {height: 20, width: 20, resizeMode: 'contain'},
  mainImage: {
    height: Layout.window.height - 250,
    width: Layout.window.width,
    resizeMode: 'contain',
    backgroundColor: 'black',
  },
  imageItem: {
    backgroundColor: 'black',
    padding: 5,
    display: 'flex',
    flexDirection: 'row',
    height: 50,
  },
  smallImage: {height: 40, width: 40, resizeMode: 'contain'},
});

export default styles;
