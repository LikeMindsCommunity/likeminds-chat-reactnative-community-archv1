import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Pressable,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import {
  convertSecondsToTime,
  decode,
  generateGifString,
} from '../../commonFuctions';
import STYLES from '../../constants/Styles';
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
  STATUS_BAR_STYLE,
} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../store';
import {CAROUSEL_SCREEN} from '../../constants/Screens';
import {
  AUDIO_TEXT,
  CAPITAL_GIF_TEXT,
  FAILED,
  GIF_TEXT,
  IMAGE_TEXT,
  PDF_TEXT,
  SUCCESS,
  VIDEO_TEXT,
  VOICE_NOTE_TEXT,
} from '../../constants/Strings';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  useActiveTrack,
  useProgress,
} from 'react-native-track-player';
import {onPausePlay, onResumePlay, startPlay, stopPlay} from '../../audio';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';
import {Events, Keys} from '../../enums';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Base64} from '../../aws-exports';
import {onSeekTo} from '../../audio/Controls';

interface AttachmentConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  navigation: any;
  openKeyboard: any;
  longPressOpenKeyboard: any;
  isReplyConversation?: any;
  handleFileUpload: any;
  isReply?: any;
  chatroomName: string;
}

const AttachmentConversations = ({
  item,
  isTypeSent,
  isIncluded,
  navigation,
  openKeyboard,
  longPressOpenKeyboard,
  isReplyConversation,
  handleFileUpload,
  isReply,
  chatroomName,
}: AttachmentConversations) => {
  const [isVoiceNotePlaying, setIsVoiceNotePlaying] = useState(false);
  const [isGifPlaying, setIsGifPlaying] = useState(false);
  const progress = useProgress();
  const activeTrack = useActiveTrack();

  let firstAttachment = item?.attachments[0];
  const isAudioActive =
    activeTrack?.externalUrl === firstAttachment?.url ? true : false;
  const isGif = firstAttachment?.type === GIF_TEXT;
  const isAnswer = isGif ? !!generateGifString(item?.answer) : !!item?.answer;
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.homefeed);
  const {selectedMessages, stateArr, isLongPress}: any = useAppSelector(
    state => state.chatroom,
  );

  // to stop the audio if move out of the chatroom
  useEffect(() => {
    if (progress.duration <= progress.position) {
      TrackPlayer.reset();
      setIsVoiceNotePlaying(false);
    }
  }, [progress]);

  // to handle start player
  const handleStartPlay = async (path: string) => {
    if (Platform.OS === 'ios') {
      const fileExtension = 'm4a';

      const dir = ReactNativeBlobUtil.fs.dirs.DocumentDir;
      const localPath = `${dir}/${Base64.btoa(path)}.${fileExtension}`;
      ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: fileExtension,
        path: localPath,
      })
        .fetch('GET', path)
        .then(async res => {
          const internalUrl = `file://${res.path()}`;
          await startPlay(internalUrl, path);
          setIsVoiceNotePlaying(true);
        });
    } else {
      await startPlay(path, path);
      setIsVoiceNotePlaying(true);
    }
    LMChatAnalytics.track(
      Events.VOICE_NOTE_PLAYED,
      new Map<string, string>([
        [Keys.CHATROOM_TYPE, item?.state?.toString()],
        [Keys.CHATROOM_ID, item?.chatroomId?.toString()],
        [Keys.MESSAGE_ID, item?.id?.toString()],
      ]),
    );
  };

  // to pause playing audio recording
  const handleOnPausePlay = async () => {
    const value = await onPausePlay();
    setIsVoiceNotePlaying(value);
  };

  // to resume playing audio recording
  const handleOnResumePlay = async () => {
    const value = await onResumePlay();
    setIsVoiceNotePlaying(value);
  };

  // to seek player to the provided time
  const handleOnSeekTo = async (value: number) => {
    const secondsToSeek = value * (firstAttachment?.metaRO?.duration / 100);
    await onSeekTo(secondsToSeek);
  };

  // to play and stop gif after 2s
  const playGif = () => {
    setIsGifPlaying(true);
    setTimeout(() => {
      setIsGifPlaying(false);
    }, 2000);
  };

  // handle gif on long press
  const handleLongPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    longPressOpenKeyboard();
  };

  // handle gif on press
  const handleOnPress = (event: any, url: string, index: number) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    let isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state),
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({type: LONG_PRESSED, body: false});
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else {
      playGif();
    }
  };
  return (
    <View
      style={[
        styles.displayRow,
        {
          justifyContent: isTypeSent ? 'flex-end' : 'flex-start',
        },
      ]}>
      <View
        style={[
          styles.attachmentMessage,
          {
            width: isReplyConversation ? '100%' : '80%',
            padding: isReplyConversation ? 0 : 10,
          },
          isTypeSent ? styles.sentMessage : styles.receivedMessage,
          isIncluded ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE} : null,
        ]}>
        {!!(item?.member?.id == user?.id) || isReply ? null : (
          <Text style={styles.messageInfo} numberOfLines={1}>
            {item?.member?.name}
            {item?.member?.customTitle ? (
              <Text
                style={
                  styles.messageCustomTitle
                }>{` • ${item?.member?.customTitle}`}</Text>
            ) : null}
          </Text>
        )}
        {firstAttachment?.type === IMAGE_TEXT ? (
          <ImageConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            navigation={navigation}
            longPressOpenKeyboard={longPressOpenKeyboard}
            handleFileUpload={handleFileUpload}
          />
        ) : firstAttachment?.type === PDF_TEXT ? (
          <PDFConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            longPressOpenKeyboard={longPressOpenKeyboard}
            handleFileUpload={handleFileUpload}
          />
        ) : firstAttachment?.type === VIDEO_TEXT ? (
          <ImageConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            navigation={navigation}
            longPressOpenKeyboard={longPressOpenKeyboard}
            handleFileUpload={handleFileUpload}
          />
        ) : firstAttachment?.type === AUDIO_TEXT ? (
          <View>
            <Text style={styles.deletedMsg}>
              This message is not supported in this app yet.
            </Text>
          </View>
        ) : firstAttachment?.type === VOICE_NOTE_TEXT ? (
          <View>
            <View style={styles.voiceNotesParentBox}>
              {isVoiceNotePlaying && isAudioActive ? (
                <TouchableOpacity
                  onPress={() => {
                    handleOnPausePlay();
                  }}
                  style={styles.playPauseBox}>
                  <Image
                    source={require('../../assets/images/pause_icon3x.png')}
                    style={styles.playPauseImage}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    if (progress.position > 0 && isAudioActive) {
                      handleOnResumePlay();
                    } else {
                      handleStartPlay(firstAttachment?.url);
                    }
                  }}
                  style={styles.playPauseBox}>
                  <Image
                    style={styles.playPauseImage}
                    source={require('../../assets/images/play_icon3x.png')}
                  />
                </TouchableOpacity>
              )}
              <View
                style={{
                  flex: 1,
                  marginTop: Platform.OS === 'ios' ? 0 : 10,
                  gap: 3,
                }}>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  step={0}
                  value={
                    isAudioActive
                      ? progress.position / progress.duration
                        ? (progress.position / progress.duration) * 100
                        : 0
                      : 0
                  }
                  minimumTrackTintColor="#ffad31"
                  maximumTrackTintColor="grey"
                  tapToSeek={true}
                  onSlidingComplete={handleOnSeekTo}
                  thumbTintColor="#ffad31"
                />
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginLeft: 10,
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../../assets/images/mic_icon3x.png')}
                    style={[styles.smallIcon, {tintColor: 'grey'}]}
                  />
                  {isVoiceNotePlaying ? (
                    <Text style={styles.recordTitle}>
                      {!isAudioActive && !!progress.position
                        ? convertSecondsToTime(0)
                        : convertSecondsToTime(Math.floor(progress.position))}
                    </Text>
                  ) : (
                    <Text style={styles.recordTitle}>
                      {convertSecondsToTime(
                        Math.floor(firstAttachment?.metaRO?.duration),
                      )}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            {item?.isInProgress === SUCCESS ? (
              <View style={styles.uploadingIndicator}>
                <ActivityIndicator
                  size="large"
                  color={STYLES.$COLORS.SECONDARY}
                />
              </View>
            ) : item?.isInProgress === FAILED ? (
              <View style={styles.uploadingIndicator}>
                <Pressable
                  onPress={() => {
                    handleFileUpload(item?.id, true);
                  }}
                  style={({pressed}) => [
                    {
                      opacity: pressed ? 0.5 : 1,
                    },
                    styles.retryButton,
                  ]}>
                  <Image
                    style={styles.retryIcon}
                    source={require('../../assets/images/retry_file_upload3x.png')}
                  />
                  <Text style={styles.retryText}>RETRY</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : isGif ? (
          <View
            style={
              isIncluded
                ? {
                    backgroundColor: STYLES.$COLORS.SELECTED_BLUE,
                    opacity: 0.7,
                  }
                : null
            }>
            {!isGifPlaying && !item?.isInProgress ? (
              <TouchableOpacity
                onPress={handleOnPress}
                onLongPress={handleLongPress}
                style={[
                  {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 150,
                    position: 'absolute',
                    width: '100%',
                    zIndex: 1,
                  },
                ]}>
                <View
                  style={{
                    backgroundColor: 'black',
                    opacity: 0.9,
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  <Text style={{color: 'white'}}>{CAPITAL_GIF_TEXT}</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {isGifPlaying ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  navigation.navigate(CAROUSEL_SCREEN, {
                    dataObject: item,
                    index: 0,
                  });
                  dispatch({
                    type: STATUS_BAR_STYLE,
                    body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
                  });
                }}>
                <Image
                  source={{
                    uri: firstAttachment?.url,
                  }}
                  style={styles.singleImg}
                />
              </TouchableWithoutFeedback>
            ) : (
              <Image
                source={{
                  uri: firstAttachment?.thumbnailUrl,
                }}
                style={styles.singleImg}
              />
            )}

            {item?.isInProgress === SUCCESS ? (
              <View style={styles.uploadingIndicator}>
                <ActivityIndicator
                  size="large"
                  color={STYLES.$COLORS.SECONDARY}
                />
              </View>
            ) : item?.isInProgress === FAILED ? (
              <View style={styles.uploadingIndicator}>
                <Pressable
                  onPress={() => {
                    handleFileUpload(item?.id, true);
                  }}
                  style={({pressed}) => [
                    {
                      opacity: pressed ? 0.5 : 1,
                    },
                    styles.retryButton,
                  ]}>
                  <Image
                    style={styles.retryIcon}
                    source={require('../../assets/images/retry_file_upload3x.png')}
                  />
                  <Text style={styles.retryText}>RETRY</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {isAnswer ? (
          <View style={styles.messageText as any}>
            {decode(
              isGif ? generateGifString(item?.answer) : item?.answer,
              true,
              chatroomName,
              user?.sdkClientInfo?.community,
            )}
          </View>
        ) : null}
        <View style={styles.alignTime}>
          {item?.isEdited ? (
            <Text style={styles.messageDate}>{'Edited • '}</Text>
          ) : null}
          <Text style={styles.messageDate}>{item?.createdAt}</Text>
        </View>
      </View>

      {!isTypeSent && !(firstAttachment?.type === AUDIO_TEXT) ? (
        <Pressable
          onLongPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            longPressOpenKeyboard();
          }}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            openKeyboard();
          }}>
          <Image
            style={{
              height: 25,
              width: 25,
              resizeMode: 'contain',
            }}
            source={require('../../assets/images/add_more_emojis3x.png')}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

export default AttachmentConversations;

interface PDFConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  longPressOpenKeyboard: any;
  handleFileUpload: any;
}

export const VideoConversations = ({
  item,
  isTypeSent,
  isIncluded,
  longPressOpenKeyboard,
  handleFileUpload,
}: PDFConversations) => {
  const firstAttachment = item?.attachments[0];
  const secondAttachment = item?.attachments[1];
  const dispatch = useAppDispatch();
  const {selectedMessages, stateArr, isLongPress}: any = useAppSelector(
    state => state.chatroom,
  );
  const [isFullList, setIsFullList] = useState(false);

  const handleLongPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    longPressOpenKeyboard();
  };

  const handleOnPress = (event: any, url: string) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    const isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state),
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({type: LONG_PRESSED, body: false});
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else {
      Linking.openURL(url);
    }
  };
  return (
    <View>
      {item?.attachmentCount > 1 ? (
        <View style={{gap: 2}}>
          {!isFullList ? (
            <View>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, firstAttachment?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/play_video.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {firstAttachment?.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, secondAttachment?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/play_video.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {secondAttachment?.name}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            item?.attachments.map((val: any, index: number) => (
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, val?.url);
                }}
                key={val + index}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/play_video.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {val?.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            handleOnPress(event, firstAttachment?.url);
          }}
          style={styles.alignRow}>
          <Image
            source={require('../../assets/images/play_video.png')}
            style={styles.icon}
          />
          <Text numberOfLines={2} style={styles.docName}>
            {firstAttachment?.name}
          </Text>
        </TouchableOpacity>
      )}
      {item.attachmentCount > 2 && !isFullList && (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            const isStateIncluded = stateArr.includes(item?.state);
            if (isLongPress) {
              if (isIncluded) {
                const filterdMessages = selectedMessages.filter(
                  (val: any) =>
                    val?.id !== item?.id && !stateArr.includes(val?.state),
                );
                if (filterdMessages.length > 0) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                } else {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                  dispatch({type: LONG_PRESSED, body: false});
                }
              } else {
                if (!isStateIncluded) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...selectedMessages, item],
                  });
                }
              }
            } else {
              setIsFullList(true);
            }
          }}>
          <Text style={styles.fullListCount}>{`+${
            item.attachmentCount - 2
          } more`}</Text>
        </TouchableOpacity>
      )}
      {item?.isInProgress === SUCCESS ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
        </View>
      ) : item?.isInProgress === FAILED ? (
        <View style={styles.uploadingIndicator}>
          <Pressable
            onPress={() => {
              handleFileUpload(item?.id, true);
            }}
            style={({pressed}) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.retryButton,
            ]}>
            <Image
              style={styles.retryIcon}
              source={require('../../assets/images/retry_file_upload3x.png')}
            />
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

export const PDFConversations = ({
  item,
  isTypeSent,
  isIncluded,
  longPressOpenKeyboard,
  handleFileUpload,
}: PDFConversations) => {
  const firstAttachment = item?.attachments[0];
  const secondAttachment = item?.attachments[1];
  const dispatch = useAppDispatch();
  const {selectedMessages, stateArr, isLongPress}: any = useAppSelector(
    state => state.chatroom,
  );
  const {isFileUploading, fileUploadingID}: any = useAppSelector(
    state => state.upload,
  );
  const [isFullList, setIsFullList] = useState(false);
  const handleLongPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    longPressOpenKeyboard();
  };

  const handleOnPress = (event: any, url: string) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    const isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state),
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({type: LONG_PRESSED, body: false});
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else {
      Linking.openURL(url);
    }
  };
  return (
    <View>
      {item?.attachmentCount > 1 ? (
        <View style={{gap: 2}}>
          {!isFullList ? (
            <View>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, firstAttachment?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {firstAttachment?.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, secondAttachment?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {secondAttachment?.name}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            item?.attachments.map((val: any, index: number) => (
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, val?.url);
                }}
                key={val + index}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {val?.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            handleOnPress(event, firstAttachment?.url);
          }}
          style={styles.alignRow}>
          <Image
            source={require('../../assets/images/pdf_icon3x.png')}
            style={styles.icon}
          />
          <Text numberOfLines={2} style={styles.docName}>
            {firstAttachment?.name}
          </Text>
        </TouchableOpacity>
      )}
      {item.attachmentCount > 2 && !isFullList && (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            const isStateIncluded = stateArr.includes(item?.state);
            if (isLongPress) {
              if (isIncluded) {
                const filterdMessages = selectedMessages.filter(
                  (val: any) =>
                    val?.id !== item?.id && !stateArr.includes(val?.state),
                );
                if (filterdMessages.length > 0) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                } else {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                  dispatch({type: LONG_PRESSED, body: false});
                }
              } else {
                if (!isStateIncluded) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...selectedMessages, item],
                  });
                }
              }
            } else {
              setIsFullList(true);
            }
          }}>
          <Text style={styles.fullListCount}>{`+${
            item.attachmentCount - 2
          } more`}</Text>
        </TouchableOpacity>
      )}
      {item?.isInProgress === SUCCESS ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
        </View>
      ) : item?.isInProgress === FAILED ? (
        <View style={styles.uploadingIndicator}>
          <Pressable
            onPress={() => {
              handleFileUpload(item?.id, true);
            }}
            style={({pressed}) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.retryButton,
            ]}>
            <Image
              style={styles.retryIcon}
              source={require('../../assets/images/retry_file_upload3x.png')}
            />
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

interface ImageConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  navigation: any;
  longPressOpenKeyboard: any;
  handleFileUpload: any;
}

export const ImageConversations = ({
  item,
  isTypeSent,
  isIncluded,
  navigation,
  longPressOpenKeyboard,
  handleFileUpload,
}: ImageConversations) => {
  const firstAttachment = item?.attachments[0];
  const secondAttachment = item?.attachments[1];
  const thirdAttachment = item?.attachments[2];
  const fourthAttachment = item?.attachments[3];
  const dispatch = useAppDispatch();
  const {selectedMessages, stateArr, isLongPress}: any = useAppSelector(
    state => state.chatroom,
  );

  // handle on long press on attachment
  const handleLongPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    longPressOpenKeyboard();
  };

  // handle on press on attachment
  const handleOnPress = (event: any, url: string, index: number) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    const isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state),
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({type: LONG_PRESSED, body: false});
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else {
      navigation.navigate(CAROUSEL_SCREEN, {
        dataObject: item,
        index,
      });
      dispatch({
        type: STATUS_BAR_STYLE,
        body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
      });
    }
  };

  let firstImageSource = null;

  if (firstAttachment) {
    if (
      (firstAttachment.type === VIDEO_TEXT &&
        firstAttachment.thumbnailUrl === null) ||
      (firstAttachment.type === IMAGE_TEXT && firstAttachment.url === null)
    ) {
      // Use require for video or image
      firstImageSource = require('../../assets/images/imagePlaceholder.jpeg');
    } else {
      // Use the uri
      firstImageSource = {
        uri:
          firstAttachment?.type === VIDEO_TEXT
            ? firstAttachment?.thumbnailUrl
            : firstAttachment?.url,
      };
    }
  }

  let secondImageSource = null;

  if (secondAttachment) {
    if (
      (secondAttachment.type === VIDEO_TEXT &&
        secondAttachment.thumbnailUrl === null) ||
      (secondAttachment.type === IMAGE_TEXT && secondAttachment.url === null)
    ) {
      // Use require for video or image
      secondImageSource = require('../../assets/images/imagePlaceholder.jpeg');
    } else {
      // Use the uri
      secondImageSource = {
        uri:
          secondAttachment?.type === VIDEO_TEXT
            ? secondAttachment?.thumbnailUrl
            : secondAttachment?.url,
      };
    }
  }

  let thirdImageSource = null;

  if (thirdAttachment) {
    if (
      (thirdAttachment.type === VIDEO_TEXT &&
        thirdAttachment.thumbnailUrl === null) ||
      (thirdAttachment.type === IMAGE_TEXT && thirdAttachment.url === null)
    ) {
      // Use require for video or image
      thirdImageSource = require('../../assets/images/imagePlaceholder.jpeg');
    } else {
      // Use the uri
      thirdImageSource = {
        uri:
          thirdAttachment?.type === VIDEO_TEXT
            ? thirdAttachment?.thumbnailUrl
            : thirdAttachment?.url,
      };
    }
  }

  let fourthImageSource = null;

  if (fourthAttachment) {
    if (
      (fourthAttachment.type === VIDEO_TEXT &&
        fourthAttachment.thumbnailUrl === null) ||
      (fourthAttachment.type === IMAGE_TEXT && fourthAttachment.url === null)
    ) {
      // Use require for video or image
      fourthImageSource = require('../../assets/images/imagePlaceholder.jpeg');
    } else {
      // Use the uri
      fourthImageSource = {
        uri:
          fourthAttachment?.type === VIDEO_TEXT
            ? fourthAttachment?.thumbnailUrl
            : fourthAttachment?.url,
      };
    }
  }

  return (
    <View>
      {item?.attachmentCount === 1 ? (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            handleOnPress(event, firstAttachment?.url, 0);
          }}>
          <Image style={styles.singleImg} source={firstImageSource} />
          {firstAttachment?.type === VIDEO_TEXT ? (
            <View style={{position: 'absolute', bottom: 0, left: 5}}>
              <Image
                source={require('../../assets/images/video_icon3x.png')}
                style={styles.videoIcon}
              />
            </View>
          ) : null}
        </TouchableOpacity>
      ) : item?.attachmentCount === 2 ? (
        <View style={styles.doubleImgParent}>
          <TouchableOpacity
            style={styles.touchableImg}
            onLongPress={handleLongPress}
            delayLongPress={200}
            onPress={event => {
              handleOnPress(event, firstAttachment?.url, 0);
            }}>
            <Image source={firstImageSource} style={styles.doubleImg} />
            {firstAttachment?.type === VIDEO_TEXT ? (
              <View style={{position: 'absolute', bottom: 0, left: 5}}>
                <Image
                  source={require('../../assets/images/video_icon3x.png')}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touchableImg}
            onLongPress={handleLongPress}
            delayLongPress={200}
            onPress={event => {
              handleOnPress(event, secondAttachment?.url, 1);
            }}>
            <Image source={secondImageSource} style={styles.doubleImg} />
            {secondAttachment?.type === VIDEO_TEXT ? (
              <View style={{position: 'absolute', bottom: 0, left: 5}}>
                <Image
                  source={require('../../assets/images/video_icon3x.png')}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      ) : item?.attachmentCount === 3 ? (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            const isStateIncluded = stateArr.includes(item?.state);
            if (isLongPress) {
              if (isIncluded) {
                const filterdMessages = selectedMessages.filter(
                  (val: any) =>
                    val?.id !== item?.id && !stateArr.includes(val?.state),
                );
                if (filterdMessages.length > 0) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                } else {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                  dispatch({type: LONG_PRESSED, body: false});
                }
              } else {
                if (!isStateIncluded) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...selectedMessages, item],
                  });
                }
              }
            } else {
              navigation.navigate(CAROUSEL_SCREEN, {
                dataObject: item,
                index: 0,
              });
              dispatch({
                type: STATUS_BAR_STYLE,
                body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
              });
            }
          }}
          style={styles.doubleImgParent}>
          <View style={styles.imgParent}>
            <Image source={firstImageSource} style={styles.multipleImg} />
            {firstAttachment?.type === VIDEO_TEXT ? (
              <View style={{position: 'absolute', bottom: 0, left: 5}}>
                <Image
                  source={require('../../assets/images/video_icon3x.png')}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.imgParent}>
            <Image style={styles.multipleImg} source={secondImageSource} />
            {firstAttachment?.type === VIDEO_TEXT ? (
              <View style={{position: 'absolute', bottom: 0, left: 5}}>
                <Image
                  source={require('../../assets/images/video_icon3x.png')}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.tripleImgOverlay}>
            <Text style={styles.tripleImgText}>+2</Text>
          </View>
        </TouchableOpacity>
      ) : item?.attachmentCount === 4 ? (
        <View style={{gap: 5}}>
          <View style={styles.doubleImgParent}>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={event => {
                handleOnPress(event, firstAttachment?.url, 0);
              }}>
              <Image source={firstImageSource} style={styles.doubleImg} />
              {firstAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={event => {
                handleOnPress(event, secondAttachment?.url, 1);
              }}>
              <Image source={secondImageSource} style={styles.doubleImg} />
              {secondAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
          <View style={styles.doubleImgParent}>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={event => {
                handleOnPress(event, thirdAttachment?.url, 2);
              }}>
              <Image source={thirdImageSource} style={styles.doubleImg} />
              {thirdAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={event => {
                handleOnPress(event, fourthAttachment?.url, 3);
              }}>
              <Image source={fourthImageSource} style={styles.doubleImg} />
              {fourthAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      ) : item?.attachmentCount > 4 ? (
        <TouchableOpacity
          style={{gap: 5}}
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            const isStateIncluded = stateArr.includes(item?.state);
            if (isLongPress) {
              if (isIncluded) {
                const filterdMessages = selectedMessages.filter(
                  (val: any) =>
                    val?.id !== item?.id && !stateArr.includes(val?.state),
                );
                if (filterdMessages.length > 0) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                } else {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                  dispatch({type: LONG_PRESSED, body: false});
                }
              } else {
                if (!isStateIncluded) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...selectedMessages, item],
                  });
                }
              }
            } else {
              navigation.navigate(CAROUSEL_SCREEN, {
                dataObject: item,
                index: 0,
              });
              dispatch({
                type: STATUS_BAR_STYLE,
                body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
              });
            }
          }}>
          <View style={styles.doubleImgParent}>
            <View style={styles.imgParent}>
              <Image source={firstImageSource} style={styles.multipleImg} />
              {firstAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View style={styles.imgParent}>
              <Image style={styles.multipleImg} source={secondImageSource} />
              {secondAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.doubleImgParent}>
            <View style={styles.imgParent}>
              <Image source={thirdImageSource} style={styles.multipleImg} />
              {thirdAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View style={styles.imgParent}>
              <Image style={styles.multipleImg} source={fourthImageSource} />
              {fourthAttachment?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View style={styles.tripleImgOverlay}>
              <Text style={styles.tripleImgText}>{`+${
                item?.attachmentCount - 3
              }`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
      {isIncluded && item?.attachmentCount <= 3 ? (
        <View
          style={{
            position: 'absolute',
            height: 150,
            width: '100%',
            backgroundColor: STYLES.$COLORS.SELECTED_BLUE,
            opacity: 0.5,
          }}
        />
      ) : isIncluded && item?.attachmentCount > 3 ? (
        <View
          style={{
            position: 'absolute',
            height: 310,
            width: '100%',
            backgroundColor: STYLES.$COLORS.SELECTED_BLUE,
            opacity: 0.5,
          }}
        />
      ) : null}

      {item?.isInProgress === SUCCESS ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
        </View>
      ) : item?.isInProgress === FAILED ? (
        <View style={styles.uploadingIndicator}>
          <Pressable
            onPress={() => {
              handleFileUpload(item?.id, true);
            }}
            style={({pressed}) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.retryButton,
            ]}>
            <Image
              style={styles.retryIcon}
              source={require('../../assets/images/retry_file_upload3x.png')}
            />
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
