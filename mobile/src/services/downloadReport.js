import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const baseURL =
  (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiBaseUrl) ||
  'http://10.0.2.2:4000';

// Downloads the session PDF report to the app's cache and offers the user
// the system share/save sheet. Returns the local file URI on success.
export async function downloadSessionReport(sessionId) {
  if (!sessionId) throw new Error('Missing session id');

  const token = await SecureStore.getItemAsync('token');
  const url = `${baseURL}/reports/session/${sessionId}/pdf`;
  const filename = `SmartPrep-Report-${sessionId}.pdf`;
  const target = `${FileSystem.cacheDirectory}${filename}`;

  const result = await FileSystem.downloadAsync(url, target, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (result.status !== 200) {
    throw new Error(`Download failed (status ${result.status})`);
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'SmartPrep Interview Report',
      UTI: 'com.adobe.pdf'
    });
  } else {
    Alert.alert(
      'Report saved',
      `Saved to:\n${result.uri}`,
      [{ text: 'OK' }]
    );
  }

  return result.uri;
}
