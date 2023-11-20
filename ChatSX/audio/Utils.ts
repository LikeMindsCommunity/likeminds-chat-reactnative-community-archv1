import {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVModeIOSOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

export function generateVoiceNoteName() {
  const currentDate = new Date();
  const timestamp = currentDate
    .toISOString()
    .replace(/[-T:]/g, '')
    .slice(0, -5); // Remove dashes, colons, and seconds

  return `VOC_${timestamp}`; // You can change the file extension or format as needed
}

export function generateAudioSet() {
  const audioSet: AudioSet = {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
    AVModeIOS: AVModeIOSOption.measurement,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    AVNumberOfChannelsKeyIOS: 2,
    AVFormatIDKeyIOS: AVEncodingOption.aac,
  };
  return audioSet;
}
