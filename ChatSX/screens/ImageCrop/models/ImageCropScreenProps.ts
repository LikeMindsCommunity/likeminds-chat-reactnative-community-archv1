import {RouteProp} from '@react-navigation/native';

export interface ImageCropScreenProps {
  navigation: any;
  route: RouteProp<
    {
      params: {uri: string; fileName: string};
      name: Record<string, object | undefined>;
    },
    'params'
  >;
}
