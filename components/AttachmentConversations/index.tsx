import {View, Text, Image, TouchableOpacity, Linking} from 'react-native';
import React, {useState} from 'react';
import {styles} from './styles';
import {decode} from '../../commonFuctions';
import STYLES from '../../constants/Styles';

interface AttachmentConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  navigation: any;
}

const AttachmentConversations = ({
  item,
  isTypeSent,
  isIncluded,
  navigation,
}: AttachmentConversations) => {
  return (
    <View
      style={[
        styles.attachmentMessage,
        isTypeSent ? styles.sentMessage : styles.receivedMessage,
        isIncluded ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE} : null,
      ]}>
      {item?.attachments[0]?.type === 'image' ? (
        <ImageConversations
          isIncluded={isIncluded}
          item={item}
          isTypeSent={isTypeSent}
          navigation={navigation}
        />
      ) : item?.attachments[0]?.type === 'pdf' ? (
        <PDFConversations
          isIncluded={isIncluded}
          item={item}
          isTypeSent={isTypeSent}
        />
      ) : item?.attachments[0]?.type === 'video' ? (
        <VideoConversations
          isIncluded={isIncluded}
          item={item}
          isTypeSent={isTypeSent}
        />
      ) : null}

      <View style={styles.messageText as any}>
        {decode(item?.answer, true)}
      </View>
      <Text style={styles.messageDate}>{item?.created_at}</Text>
    </View>
  );
};

export default AttachmentConversations;

interface PDFConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
}

export const VideoConversations = ({
  item,
  isTypeSent,
  isIncluded,
}: PDFConversations) => {
  const [isFullList, setIsFullList] = useState(false);
  return (
    <View>
      {item?.attachment_count > 1 ? (
        <View style={{gap: 2}}>
          {!isFullList ? (
            <View>
              <TouchableOpacity
                onPress={() => {
                  if (!isIncluded) {
                    Linking.openURL(item?.attachments[0]?.url);
                  }
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
                onPress={() => {
                  if (!isIncluded) {
                    Linking.openURL(item?.attachments[1]?.url);
                  }
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
                onPress={() => {
                  if (!isIncluded) {
                    Linking.openURL(val?.url);
                  }
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
          onPress={() => {
            if (!isIncluded) {
              Linking.openURL(item?.attachments[0]?.url);
            }
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
          onPress={() => {
            setIsFullList(true);
          }}>
          <Text style={styles.fullListCount}>{`+${
            item.attachment_count - 2
          } more`}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const PDFConversations = ({
  item,
  isTypeSent,
  isIncluded,
}: PDFConversations) => {
  const [isFullList, setIsFullList] = useState(false);
  return (
    <View>
      {item?.attachment_count > 1 ? (
        <View style={{gap: 2}}>
          {!isFullList ? (
            <View>
              <TouchableOpacity
                onPress={() => {
                  if (!isIncluded) {
                    Linking.openURL(item?.attachments[0]?.url);
                  }
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
                onPress={() => {
                  if (!isIncluded) {
                    Linking.openURL(item?.attachments[1]?.url);
                  }
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
                onPress={() => {
                  if (!isIncluded) {
                    Linking.openURL(val?.url);
                  }
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
          onPress={() => {
            if (!isIncluded) {
              Linking.openURL(item?.attachments[0]?.url);
            }
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
          onPress={() => {
            setIsFullList(true);
          }}>
          <Text style={styles.fullListCount}>{`+${
            item.attachment_count - 2
          } more`}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface ImageConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  navigation: any;
}

export const ImageConversations = ({
  item,
  isTypeSent,
  isIncluded,
  navigation,
}: ImageConversations) => {
  const [isFullList, setIsFullList] = useState(false);
  return (
    <View>
      {item?.attachment_count === 1 ? (
        <TouchableOpacity
          onPress={() => {
            if (!isIncluded) {
              Linking.openURL(item?.attachments[0]?.url);
            }
          }}>
          <Image
            style={styles.singleImg}
            source={{uri: item?.attachments[0]?.url}}
          />
        </TouchableOpacity>
      ) : item?.attachment_count === 2 ? (
        <View style={styles.doubleImgParent}>
          <TouchableOpacity
            style={styles.touchableImg}
            onPress={() => {
              if (!isIncluded) {
                Linking.openURL(item?.attachments[0]?.url);
              }
            }}>
            <Image
              source={{uri: item.attachments[0].url}}
              style={styles.doubleImg}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touchableImg}
            onPress={() => {
              if (!isIncluded) {
                Linking.openURL(item?.attachments[1]?.url);
              }
            }}>
            <Image
              source={{uri: item.attachments[1].url}}
              style={styles.doubleImg}
            />
          </TouchableOpacity>
        </View>
      ) : item?.attachment_count === 3 ? (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ImageScreen', {
              attachments: item?.attachments,
            });
          }}
          style={styles.doubleImgParent}>
          <Image
            source={{uri: item.attachments[0].url}}
            style={styles.multipleImg}
          />
          <Image
            style={styles.multipleImg}
            source={{uri: item.attachments[1].url}}
          />
          <View style={styles.tripleImgOverlay}>
            <Text style={styles.tripleImgText}>+2</Text>
          </View>
        </TouchableOpacity>
      ) : item?.attachment_count > 3 ? (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ImageScreen', {
              attachments: item?.attachments,
            });
          }}>
          <View style={styles.doubleImgParent}>
            <Image
              source={{uri: item.attachments[0].url}}
              style={styles.multipleImg}
            />
            <Image
              style={styles.multipleImg}
              source={{uri: item.attachments[1].url}}
            />
          </View>
          <View style={styles.doubleImgParent}>
            <Image
              source={{uri: item.attachments[2].url}}
              style={styles.multipleImg}
            />
            <Image
              style={styles.multipleImg}
              source={{uri: item.attachments[3].url}}
            />
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
    </View>
  );
};
