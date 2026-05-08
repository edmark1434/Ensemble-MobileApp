import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type AppTitleProps = {
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: { width: 112, height: 28 },
  md: { width: 132, height: 34 },
  lg: { width: 160, height: 40 },
};

export function AppTitle({ size = 'md' }: AppTitleProps) {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/app_title.png')} style={[styles.image, sizeMap[size]]} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  image: {
    tintColor: '#F4F8FF',
  },
});
