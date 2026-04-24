/**
 * @format
 */

// Buffer polyfill for react-native-ble-plx (required for BLE base64 encode/decode)
if (!globalThis.Buffer) {
  globalThis.Buffer = require('buffer').Buffer;
}

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
