import { Platform, Alert } from 'react-native';
import {
  PERMISSIONS,
  openSettings,
  check,
  request,
  RESULTS,
} from 'react-native-permissions';

const MSG_PERMISSION_BLOCKED =
  'Permission is blocked, enable manually on setting';
const MSG_PERMISSION_UNAVAILABLE = 'Permission Unavailable';

export function getPermissionLocation(): Promise<void> {
  return new Promise(function (resolve, reject) {
    if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        .then((status) => {
          if (status === RESULTS.GRANTED) {
            resolve();
          } else if (status === RESULTS.DENIED) {
            request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
              .then(() => resolve())
              .catch((error) => reject(error));
          } else if (status === RESULTS.UNAVAILABLE) {
            _showAlertUnavailable();
          } else {
            _showAlertBlocked();
          }
        })
        .catch((error) => reject(error));
    } else if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then((status) => {
          if (status === RESULTS.GRANTED) {
            resolve();
          } else if (status === RESULTS.DENIED) {
            request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
              .then(() => resolve())
              .catch((error) => reject(error));
          } else if (status === RESULTS.UNAVAILABLE) {
            _showAlertUnavailable();
          } else {
            _showAlertBlocked();
          }
        })
        .catch((error) => reject(error));
    } else {
      reject(MSG_PERMISSION_BLOCKED);
    }
  });
}

export function getPermissionReadStorage(): Promise<void> {
  return new Promise(function (resolve, reject) {
    if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.PHOTO_LIBRARY)
        .then((status) => {
          if (status === RESULTS.GRANTED) {
            resolve();
          } else if (status === RESULTS.DENIED) {
            request(PERMISSIONS.IOS.PHOTO_LIBRARY)
              .then(() => resolve())
              .catch((error) => reject(error));
          } else if (status === RESULTS.UNAVAILABLE) {
            _showAlertUnavailable();
          } else {
            _showAlertBlocked();
          }
        })
        .catch((error) => reject(error));
    } else if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
        .then((status) => {
          if (status === RESULTS.GRANTED) {
            resolve();
          } else if (status === RESULTS.DENIED) {
            request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
              .then(() => resolve())
              .catch((error) => reject(error));
          } else if (status === RESULTS.UNAVAILABLE) {
            _showAlertUnavailable();
          } else {
            _showAlertBlocked();
          }
        })
        .catch((error) => reject(error));
    } else {
      reject(MSG_PERMISSION_BLOCKED);
    }
  });
}

export function getPermissionWriteStorage(): Promise<void> {
  // NOTE: Android Only
  return new Promise(function (resolve, reject) {
    check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
      .then((status) => {
        if (status === RESULTS.GRANTED) {
          resolve();
        } else if (status === RESULTS.DENIED) {
          request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
            .then(() => resolve())
            .catch((error) => reject(error));
        } else if (status === RESULTS.UNAVAILABLE) {
          _showAlertUnavailable();
        } else {
          _showAlertBlocked();
        }
      })
      .catch((error) => reject(error));
  });
}

function _showAlertBlocked() {
  Alert.alert(
    'Information',
    MSG_PERMISSION_BLOCKED,
    [
      {
        text: 'Not Now',
        onPress: () => {},
      },
      {
        text: 'Goto Setting',
        onPress: () => openSettings(),
      },
    ],
    { cancelable: true }
  );
}

function _showAlertUnavailable() {
  Alert.alert(
    'Information',
    MSG_PERMISSION_UNAVAILABLE,
    [
      {
        text: 'OK',
        onPress: () => {},
      },
    ],
    { cancelable: true }
  );
}
