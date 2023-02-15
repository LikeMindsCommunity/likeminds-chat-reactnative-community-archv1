import {View, Text, Image, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {styles} from './styles';
import {decode} from '../../commonFuctions';

interface AttachmentConversations {
  item: any;
  isTypeSent: boolean;
}

const AttachmentConversations = ({
  item,
  isTypeSent,
}: AttachmentConversations) => {
  return (
    <View
      style={[
        styles.attachmentMessage,
        isTypeSent ? styles.sentMessage : styles.receivedMessage,
      ]}>
      {item?.attachments[0].type === 'image' ? (
        <ImageConversations item={item} isTypeSent={isTypeSent} />
      ) : item?.attachments[0].type === 'pdf' ? (
        <PDFConversations item={item} isTypeSent={isTypeSent} />
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
}

export const PDFConversations = ({item, isTypeSent}: PDFConversations) => {
  const [isFullList, setIsFullList] = useState(false);
  return (
    <View>
      {item?.attachment_count > 1 ? (
        <View style={{gap: 2}}>
          {!isFullList ? (
            <View>
              <View style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text style={styles.docName}>{item?.attachments[0]?.name}</Text>
              </View>
              <View style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text style={styles.docName}>{item?.attachments[1]?.name}</Text>
              </View>
            </View>
          ) : (
            item?.attachments.map((val: any, index: number) => (
              <View key={val + index} style={styles.alignRow}>
                <Image
                  source={require('../../assets/images/pdf_icon3x.png')}
                  style={styles.icon}
                />
                <Text style={styles.docName}>{val?.name}</Text>
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.alignRow}>
          <Image
            source={require('../../assets/images/pdf_icon3x.png')}
            style={styles.icon}
          />
          <Text style={styles.docName}>{item?.attachments[0]?.name}</Text>
        </View>
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
}

export const ImageConversations = ({item, isTypeSent}: ImageConversations) => {
  const [isFullList, setIsFullList] = useState(false);
  return (
    <View>
      {item?.attachment_count === 1 ? (
        <View>
          <Image
            style={styles.singleImg}
            source={{uri: item.attachments[0].url}}
          />
        </View>
      ) : item?.attachment_count === 2 ? (
        <View style={styles.doubleImgParent}>
          <Image
            source={{uri: item.attachments[0].url}}
            style={styles.doubleImg}
          />
          <Image
            source={{uri: item.attachments[1].url}}
            style={styles.doubleImg}
          />
        </View>
      ) : item?.attachment_count === 3 ? (
        <View style={styles.doubleImgParent}>
          <Image
            source={{uri: item.attachments[0].url}}
            style={styles.doubleImg}
          />
          <Image
            style={styles.doubleImg}
            source={{uri: item.attachments[1].url}}
          />
          <View style={styles.tripleImgOverlay}>
            <Text style={styles.tripleImgText}>+2</Text>
          </View>
        </View>
      ) : item?.attachment_count > 3 ? (
        <View>
          <View style={styles.doubleImgParent}>
            <Image
              source={{uri: item.attachments[0].url}}
              style={styles.doubleImg}
            />
            <Image
              style={styles.doubleImg}
              source={{uri: item.attachments[1].url}}
            />
          </View>
          <View style={styles.doubleImgParent}>
            <Image
              source={{uri: item.attachments[2].url}}
              style={styles.doubleImg}
            />
            <Image
              style={styles.doubleImg}
              source={{uri: item.attachments[3].url}}
            />
            <View style={styles.tripleImgOverlay}>
              <Text style={styles.tripleImgText}>{`+${
                item?.attachment_count - 3
              }`}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};
