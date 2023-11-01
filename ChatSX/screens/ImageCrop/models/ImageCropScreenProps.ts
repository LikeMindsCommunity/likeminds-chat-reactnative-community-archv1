import {NavigationProp, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../../navigation/SwitchComponent/models';

type ImageCropScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'ImageCropScreen'
>;
type ImageCropScreenRouteProp = RouteProp<
  RootStackParamList,
  'ImageCropScreen'
>;

export interface ImageCropScreenProps {
  navigation: ImageCropScreenNavigationProp;
  route: ImageCropScreenRouteProp;
}
