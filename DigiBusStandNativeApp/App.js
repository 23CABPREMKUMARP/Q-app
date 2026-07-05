import React, { useRef, useEffect } from 'react';
import { BackHandler, SafeAreaView, StatusBar, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef(null);

  useEffect(() => {
    // Request Camera permission at runtime on Android
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission Needed',
              message: 'Digi Bus Stand needs access to your camera to scan QR codes and tickets.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Camera permission granted successfully');
          } else {
            console.log('Camera permission denied by user');
          }
        } catch (err) {
          console.warn('Error requesting camera permission:', err);
        }
      }
    };

    requestCameraPermission();

    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F28500" />
      <WebView 
        ref={webViewRef}
        source={{ uri: 'https://app-woad-beta.vercel.app?_vercel_share=xGhhMqD6mX0rHCmw2Yqvj3G608s6LC5M' }} 
        style={styles.webview}
        allowsBackForwardNavigationGestures={true}
        setSupportMultipleWindows={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        // Custom User Agent to bypass Clerk embedded WebView OAuth/authentication blocking policies
        userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        // Handle media/camera access request inside the WebView page
        onPermissionRequest={(event) => {
          event.grant(event.resources);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F28500',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
