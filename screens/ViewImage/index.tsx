import {Image, PixelRatio, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Layout from '../../constants/Layout';

const ViewImage = ({val}: any) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    Image.getSize(val?.url, (width: number, height: number) => {
      let updatedDimensions = {
        ...dimensions,
        height,
        width,
      };
      setDimensions(updatedDimensions);
    });
  }, []);

  let {height, width} = dimensions;
  let aspectRatio = height / width;

  return (
    <View>
      {!!height || !!width ? (
        <Image
          style={{
            width: '100%',
            height: 250,
            resizeMode: 'contain',
          }}
          source={{uri: val?.url}}
        />
      ) : null}
    </View>
  );
};

export default ViewImage;
