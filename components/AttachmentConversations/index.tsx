import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './styles';
import {decode} from '../../commonFuctions';
import STYLES from '../../constants/Styles';
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../store';
import {IMAGE_SCREEN, VIDEO_PLAYER} from '../../constants/Screens';
import {
  AUDIO_TEXT,
  IMAGE_TEXT,
  PDF_TEXT,
  VIDEO_TEXT,
} from '../../constants/Strings';

interface AttachmentConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  navigation: any;
  openKeyboard: any;
  longPressOpenKeyboard: any;
  isReplyConversation?: any;
}

const AttachmentConversations = ({
  item,
  isTypeSent,
  isIncluded,
  navigation,
  openKeyboard,
  longPressOpenKeyboard,
  isReplyConversation,
}: AttachmentConversations) => {
  const dispatch = useAppDispatch();
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
        {item?.attachments[0]?.type === IMAGE_TEXT ? (
          <ImageConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            navigation={navigation}
            longPressOpenKeyboard={longPressOpenKeyboard}
          />
        ) : item?.attachments[0]?.type === PDF_TEXT ? (
          <PDFConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            longPressOpenKeyboard={longPressOpenKeyboard}
          />
        ) : item?.attachments[0]?.type === VIDEO_TEXT ? (
          <ImageConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            navigation={navigation}
            longPressOpenKeyboard={longPressOpenKeyboard}
          />
        ) : item?.attachments[0]?.type === AUDIO_TEXT ? (
          <View>
            <Text style={styles.deletedMsg}>
              This message is not supported in this app yet.
            </Text>
          </View>
        ) : null}

        <View style={styles.messageText as any}>
          {decode(item?.answer, true)}
        </View>
        <Text style={styles.messageDate}>{item?.created_at}</Text>
      </View>

      {!isTypeSent && !(item?.attachments[0]?.type === AUDIO_TEXT) ? (
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
}

export const VideoConversations = ({
  item,
  isTypeSent,
  isIncluded,
  longPressOpenKeyboard,
}: PDFConversations) => {
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
      Linking.openURL(url);
    }
  };
  return (
    <View>
      {item?.attachment_count > 1 ? (
        <View style={{gap: 2}}>
          {!isFullList ? (
            <View>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, item?.attachments[0]?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/play_video.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {item?.attachments[0]?.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, item?.attachments[1]?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/play_video.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {item?.attachments[1]?.name}
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
            handleOnPress(event, item?.attachments[0]?.url);
          }}
          style={styles.alignRow}>
          <Image
            source={require('../../assets/images/play_video.png')}
            style={styles.icon}
          />
          <Text numberOfLines={2} style={styles.docName}>
            {item?.attachments[0]?.name}
          </Text>
        </TouchableOpacity>
      )}
      {item.attachment_count > 2 && !isFullList && (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            let isStateIncluded = stateArr.includes(item?.state);
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
            item.attachment_count - 2
          } more`}</Text>
        </TouchableOpacity>
      )}
      {isFileUploading && item?.id === fileUploadingID ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
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
}: PDFConversations) => {
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
      Linking.openURL(url);
    }
  };
  return (
    <View>
      {item?.attachment_count > 1 ? (
        <View style={{gap: 2}}>
          {!isFullList ? (
            <View>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, item?.attachments[0]?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {item?.attachments[0]?.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleOnPress(event, item?.attachments[1]?.url);
                }}
                style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {item?.attachments[1]?.name}
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
            handleOnPress(event, item?.attachments[0]?.url);
          }}
          style={styles.alignRow}>
          <Image
            source={require('../../assets/images/pdf_icon3x.png')}
            style={styles.icon}
          />
          <Text numberOfLines={2} style={styles.docName}>
            {item?.attachments[0]?.name}
          </Text>
        </TouchableOpacity>
      )}
      {item.attachment_count > 2 && !isFullList && (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            let isStateIncluded = stateArr.includes(item?.state);
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
            item.attachment_count - 2
          } more`}</Text>
        </TouchableOpacity>
      )}
      {isFileUploading && item?.id === fileUploadingID ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
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
}

export const ImageConversations = ({
  item,
  isTypeSent,
  isIncluded,
  navigation,
  longPressOpenKeyboard,
}: ImageConversations) => {
  const dispatch = useAppDispatch();
  const {selectedMessages, stateArr, isLongPress}: any = useAppSelector(
    state => state.chatroom,
  );
  const {isFileUploading, fileUploadingID}: any = useAppSelector(
    state => state.upload,
  );
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
      Linking.openURL(url);
    }
  };

  return (
    <View>
      {item?.attachment_count === 1 ? (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            handleOnPress(event, item?.attachments[0]?.url);
          }}>
          <Image
            style={styles.singleImg}
            source={{
              uri:
                item?.attachments[0]?.type === VIDEO_TEXT
                  ? item?.attachments[0]?.thumbnail_url
                  : item?.attachments[0]?.url,
            }}
          />
          {item?.attachments[0]?.type === VIDEO_TEXT ? (
            <View style={{position: 'absolute', bottom: 0, left: 5}}>
              <Image
                source={require('../../assets/images/video_icon3x.png')}
                style={styles.videoIcon}
              />
            </View>
          ) : null}
        </TouchableOpacity>
      ) : item?.attachment_count === 2 ? (
        <View style={styles.doubleImgParent}>
          <TouchableOpacity
            style={styles.touchableImg}
            onLongPress={handleLongPress}
            delayLongPress={200}
            onPress={event => {
              handleOnPress(event, item?.attachments[0]?.url);
            }}>
            <Image
              source={{
                uri:
                  item?.attachments[0]?.type === VIDEO_TEXT
                    ? item?.attachments[0]?.thumbnail_url
                    : item?.attachments[0]?.url,
              }}
              style={styles.doubleImg}
            />
            {item?.attachments[0]?.type === VIDEO_TEXT ? (
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
              handleOnPress(event, item?.attachments[0]?.url);
            }}>
            <Image
              source={{
                uri:
                  item?.attachments[1]?.type === VIDEO_TEXT
                    ? item?.attachments[1]?.thumbnail_url
                    : item?.attachments[1]?.url,
              }}
              style={styles.doubleImg}
            />
            {item?.attachments[0]?.type === VIDEO_TEXT ? (
              <View style={{position: 'absolute', bottom: 0, left: 5}}>
                <Image
                  source={require('../../assets/images/video_icon3x.png')}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      ) : item?.attachment_count === 3 ? (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            let isStateIncluded = stateArr.includes(item?.state);
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
              navigation.navigate(IMAGE_SCREEN, {
                attachments: item?.attachments,
              });
            }
          }}
          style={styles.doubleImgParent}>
          <View style={styles.imgParent}>
            <Image
              source={{
                uri:
                  item?.attachments[0]?.type === VIDEO_TEXT
                    ? item?.attachments[0]?.thumbnail_url
                    : item?.attachments[0]?.url,
              }}
              style={styles.multipleImg}
            />
            {item?.attachments[0]?.type === VIDEO_TEXT ? (
              <View style={{position: 'absolute', bottom: 0, left: 5}}>
                <Image
                  source={require('../../assets/images/video_icon3x.png')}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.imgParent}>
            <Image
              style={styles.multipleImg}
              source={{
                uri:
                  item?.attachments[1]?.type === VIDEO_TEXT
                    ? item?.attachments[1]?.thumbnail_url
                    : item?.attachments[1]?.url,
              }}
            />
            {item?.attachments[0]?.type === VIDEO_TEXT ? (
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
      ) : item?.attachment_count > 3 ? (
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
            let isStateIncluded = stateArr.includes(item?.state);
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
              navigation.navigate(IMAGE_SCREEN, {
                attachments: item?.attachments,
              });
            }
          }}>
          <View style={styles.doubleImgParent}>
            <View style={styles.imgParent}>
              <Image
                source={{
                  uri:
                    item?.attachments[0]?.type === VIDEO_TEXT
                      ? item?.attachments[0]?.thumbnail_url
                      : item?.attachments[0]?.url,
                }}
                style={styles.multipleImg}
              />
              {item?.attachments[0]?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View style={styles.imgParent}>
              <Image
                style={styles.multipleImg}
                source={{
                  uri:
                    item?.attachments[1]?.type === VIDEO_TEXT
                      ? item?.attachments[1]?.thumbnail_url
                      : item?.attachments[1]?.url,
                }}
              />
              {item?.attachments[1]?.type === VIDEO_TEXT ? (
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
              <Image
                source={{
                  uri:
                    item?.attachments[2]?.type === VIDEO_TEXT
                      ? item?.attachments[2]?.thumbnail_url
                      : item?.attachments[2]?.url,
                }}
                style={styles.multipleImg}
              />
              {item?.attachments[2]?.type === VIDEO_TEXT ? (
                <View style={{position: 'absolute', bottom: 0, left: 5}}>
                  <Image
                    source={require('../../assets/images/video_icon3x.png')}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View style={styles.imgParent}>
              <Image
                style={styles.multipleImg}
                source={{
                  uri:
                    item?.attachments[3]?.type === VIDEO_TEXT
                      ? item?.attachments[3]?.thumbnail_url
                      : item?.attachments[3]?.url,
                }}
              />
              {item?.attachments[3]?.type === VIDEO_TEXT ? (
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
                item?.attachment_count - 3
              }`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
      {isIncluded && (
        <View
          style={{
            position: 'absolute',
            height: 150,
            width: '100%',
            backgroundColor: STYLES.$COLORS.SELECTED_BLUE,
            opacity: 0.5,
          }}
        />
      )}

      {isFileUploading &&
      (item?.id === fileUploadingID ||
        item?.temporary_id === fileUploadingID) ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
        </View>
      ) : null}
    </View>
  );
};
