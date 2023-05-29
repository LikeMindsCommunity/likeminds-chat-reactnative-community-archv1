import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

// function checks if we have access of storage in Android.
export async function requestStoragePermission() {
  if (Platform.OS === 'android') {
    let OSVersion = Platform.constants['Release'];

    if (Number(OSVersion) < 13) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs permission to access your storage',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Storage Permission Required',
            'App needs access to your storage to read files. Please go to app settings and grant permission.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: Linking.openSettings},
            ],
          );
        } else {
          return false;
        }
      } catch (err) {
        return false;
      }
    } else {
      try {
        const grantedImageStorage = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        if (
          grantedImageStorage['android.permission.READ_MEDIA_IMAGES'] &&
          grantedImageStorage['android.permission.READ_MEDIA_VIDEO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else if (
          grantedImageStorage['android.permission.READ_MEDIA_IMAGES'] ===
            PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          grantedImageStorage['android.permission.READ_MEDIA_VIDEO'] ===
            PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          Alert.alert(
            'Storage Permission Required',
            'App needs access to your storage to read files. Please go to app settings and grant permission.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: Linking.openSettings},
            ],
          );
          return false;
        } else {
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  }
}
