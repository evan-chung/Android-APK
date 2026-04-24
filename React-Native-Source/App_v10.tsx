/**
 * LoRaTool v10 — Industrial IoT Command Center
 * CloudTek Professional Edition
 *
 * Design: Industrial IoT · Immersive Monitoring · Pro-Level Tech Aesthetic
 * Color: Electric Blue #0EA5E9 + Teal #14B8A6 + Deep Navy #0F172A
 * Icons: Custom SVG-style View Components (no emoji)
 * Logo: CloudTek (local asset)
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  TextInput, Modal, ActivityIndicator, SafeAreaView, Dimensions, Image,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { WebView } from 'react-native-webview';

// ===== CloudTek Logo Asset =====
// Logo should be placed at: android/app/src/main/res/drawable/cloudtek_logo.png
const CLOUDTEK_LOGO = require('./cloudtek_logo.png');

// ===== Google Maps Configuration =====
const GOOGLE_MAPS_API_KEY = 'AIzaSyD5ICP2AXbHVCYFLGuNLxj-5dmq2BgDuMM';

// ===== Pure JS AsyncStorage =====
const _storage = new Map<string, string>();
const AsyncStorage = {
  getItem: (key: string): Promise<string | null> => Promise.resolve(_storage.get(key) ?? null),
  setItem: (key: string, value: string): Promise<void> => { _storage.set(key, value); return Promise.resolve(); },
  removeItem: (key: string): Promise<void> => { _storage.delete(key); return Promise.resolve(); },
  clear: (): Promise<void> => { _storage.clear(); return Promise.resolve(); },
};

// ===== Mock Geolocation =====
const Geolocation = {
  getCurrentPosition: (success: Function, error?: Function, options?: any) => {
    success({ coords: { latitude: 25.0330, longitude: 121.5654, accuracy: 10 } });
  },
  watchPosition: (success: Function, error?: Function, options?: any) => 1,
  clearWatch: (id: number) => {},
  stopObserving: () => {},
};

// ===== Constants =====
const DK = 'lora_devices_v10';
const AK = 'lora_alerts_v10';
const PWD = 'cloudtek';
const { width: SCREEN_W } = Dimensions.get('window');

// ===== Design Tokens — Industrial IoT =====
const C = {
  // Primary — Electric Blue
  primary: '#0EA5E9',
  primaryH: '#0284C7',
  primaryL: '#E0F2FE',
  // Secondary — Teal
  teal: '#14B8A6',
  tealH: '#0D9488',
  tealL: '#CCFBF1',
  // Status
  success: '#10B981',
  successL: '#D1FAE5',
  warning: '#F59E0B',
  warningL: '#FEF3C7',
  danger: '#EF4444',
  dangerL: '#FEE2E2',
  info: '#3B82F6',
  infoL: '#DBEAFE',
  // Text
  text: '#0F172A',
  text2: '#475569',
  muted: '#94A3B8',
  disabled: '#CBD5E1',
  // Background
  bg: '#F1F5F9',
  card: '#FFFFFF',
  dark: '#0F172A',
  dark2: '#1E293B',
  // Border
  border: '#E2E8F0',
  borderD: '#CBD5E1',
  // Console
  logTX: '#34D399',
  logRX: '#60A5FA',
  logERR: '#F87171',
  logINFO: '#94A3B8',
};

// ===== SVG Icon Components (View-based, no dependencies) =====
const Ico = {
  // Navigation
  Home: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:20,height:16,borderWidth:2,borderColor:s,borderRadius:3}}>
        <View style={{position:'absolute',top:-6,left:2,width:12,height:8,borderWidth:2,borderColor:s,borderBottomWidth:0,borderTopLeftRadius:3,borderTopRightRadius:3}}/>
      </View>
    </View>
  ),
  Radio: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:8,height:8,borderRadius:4,backgroundColor:s}}/>
      <View style={{position:'absolute',width:16,height:16,borderRadius:8,borderWidth:1.5,borderColor:s}}/>
      <View style={{position:'absolute',width:22,height:22,borderRadius:11,borderWidth:1,borderColor:s,opacity:0.5}}/>
    </View>
  ),
  Device: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:14,height:18,borderWidth:2,borderColor:s,borderRadius:3}}/>
      <View style={{position:'absolute',bottom:5,width:6,height:2,backgroundColor:s,borderRadius:1}}/>
    </View>
  ),
  Map: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:18,height:14,borderWidth:2,borderColor:s,transform:[{skewX:'-10deg'}]}}/>
      <View style={{position:'absolute',left:6,width:2,height:18,backgroundColor:s}}/>
      <View style={{position:'absolute',right:6,width:2,height:18,backgroundColor:s}}/>
    </View>
  ),
  Bell: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:16,height:14,borderWidth:2,borderColor:s,borderRadius:8,borderBottomLeftRadius:4,borderBottomRightRadius:4}}/>
      <View style={{position:'absolute',bottom:4,width:4,height:2,backgroundColor:s,borderRadius:1}}/>
    </View>
  ),
  Chart: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{position:'absolute',bottom:5,left:5,width:2,height:8,backgroundColor:s}}/>
      <View style={{position:'absolute',bottom:5,left:10,width:2,height:12,backgroundColor:s}}/>
      <View style={{position:'absolute',bottom:5,left:15,width:2,height:6,backgroundColor:s}}/>
    </View>
  ),
  // Status
  Wifi: ({s=C.success}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{position:'absolute',width:20,height:10,borderWidth:2,borderColor:s,borderBottomLeftRadius:10,borderBottomRightRadius:10,borderTopWidth:0}}/>
      <View style={{position:'absolute',width:12,height:6,borderWidth:2,borderColor:s,borderBottomLeftRadius:6,borderBottomRightRadius:6,borderTopWidth:0}}/>
      <View style={{width:4,height:4,borderRadius:2,backgroundColor:s}}/>
    </View>
  ),
  Battery: ({s=C.text}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:18,height:10,borderWidth:2,borderColor:s,borderRadius:2}}/>
      <View style={{position:'absolute',right:2,width:2,height:4,backgroundColor:s}}/>
    </View>
  ),
  Signal: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{position:'absolute',width:4,height:4,backgroundColor:s,borderRadius:2}}/>
      <View style={{position:'absolute',width:10,height:10,borderWidth:2,borderColor:s,borderRadius:5}}/>
      <View style={{position:'absolute',width:18,height:18,borderWidth:2,borderColor:s,borderRadius:9,opacity:0.5}}/>
    </View>
  ),
  Check: ({s=C.success}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:16,height:16,borderRadius:8,borderWidth:2,borderColor:s}}/>
      <View style={{position:'absolute',width:6,height:3,borderBottomWidth:2,borderRightWidth:2,borderColor:s,transform:[{rotate:'45deg'}]}}/>
    </View>
  ),
  Alert: ({s=C.warning}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:0,height:0,backgroundColor:'transparent',borderStyle:'solid',borderLeftWidth:10,borderRightWidth:10,borderBottomWidth:16,borderLeftColor:'transparent',borderRightColor:'transparent',borderBottomColor:s}}/>
      <View style={{position:'absolute',top:10,width:2,height:6,backgroundColor:'#fff',borderRadius:1}}/>
      <View style={{position:'absolute',bottom:6,width:2,height:2,backgroundColor:'#fff',borderRadius:1}}/>
    </View>
  ),
  // Actions
  Search: ({s=C.muted}:{s?:string}) => (
    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:10,height:10,borderWidth:2,borderColor:s,borderRadius:5}}/>
      <View style={{position:'absolute',right:3,bottom:3,width:6,height:2,backgroundColor:s,transform:[{rotate:'45deg'}]}}/>
    </View>
  ),
  Send: ({s='#fff'}:{s?:string}) => (
    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:0,height:0,borderStyle:'solid',borderLeftWidth:10,borderTopWidth:6,borderBottomWidth:6,borderLeftColor:s,borderTopColor:'transparent',borderBottomColor:'transparent'}}/>
    </View>
  ),
  Trash: ({s=C.muted}:{s?:string}) => (
    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:14,height:16,borderWidth:2,borderColor:s,borderRadius:2}}/>
      <View style={{position:'absolute',top:2,width:8,height:2,backgroundColor:s}}/>
    </View>
  ),
  Chevron: ({s=C.primary,dir='right'}:{s?:string,dir?:'left'|'right'}) => (
    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center',transform:[{scaleX:dir==='left'?-1:1}]}}>
      <View style={{width:8,height:8,borderRightWidth:2,borderBottomWidth:2,borderColor:s,transform:[{rotate:'-45deg'}]}}/>
    </View>
  ),
  Settings: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:14,height:14,borderRadius:7,borderWidth:2,borderColor:s}}/>
      <View style={{position:'absolute',width:20,height:20,borderRadius:10,borderWidth:2,borderColor:s,opacity:0.3}}/>
    </View>
  ),
  Terminal: ({s=C.primary}:{s?:string}) => (
    <View style={{width:24,height:24,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:16,height:12,borderWidth:2,borderColor:s,borderRadius:2}}/>
      <View style={{position:'absolute',left:6,width:4,height:2,backgroundColor:s}}/>
      <View style={{position:'absolute',left:6,top:10,width:6,height:2,backgroundColor:s}}/>
    </View>
  ),
  X: ({s=C.muted}:{s?:string}) => (
    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center'}}>
      <View style={{position:'absolute',width:12,height:2,backgroundColor:s,transform:[{rotate:'45deg'}]}}/>
      <View style={{position:'absolute',width:12,height:2,backgroundColor:s,transform:[{rotate:'-45deg'}]}}/>
    </View>
  ),
  Plus: ({s='#fff'}:{s?:string}) => (
    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:12,height:2,backgroundColor:s}}/>
      <View style={{position:'absolute',width:2,height:12,backgroundColor:s}}/>
    </View>
  ),
  Pin: ({s=C.primary}:{s?:string}) => (
    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center'}}>
      <View style={{width:8,height:8,borderRadius:4,backgroundColor:s}}/>
      <View style={{position:'absolute',bottom:2,width:2,height:8,backgroundColor:s}}/>
    </View>
  ),
};

// ===== LoRa Commands (52 keys) =====
const CMDS = [
  {k:0x01,l:'Firmware Version',s:'VER',d:'read',t:'hex'},
  {k:0x02,l:'MAC Address',s:'MAC',d:'read',t:'hex'},
  {k:0x03,l:'Battery Level',s:'BAT',d:'read',t:'u8',o:['0-100%']},
  {k:0x04,l:'Device Name',s:'NAME',d:'both',t:'str'},
  {k:0x05,l:'Hardware Version',s:'HW',d:'read',t:'hex'},
  {k:0x10,l:'Work Mode',s:'MODE',d:'both',t:'u8',o:['Standby','Periodic','Timing','Motion']},
  {k:0x11,l:'Heartbeat Interval',s:'HBT',d:'both',t:'u16',u:'sec',r:[5,3600]},
  {k:0x12,l:'Time Zone Offset',s:'TZ',d:'both',t:'i8',u:'×15min'},
  {k:0x13,l:'Standby Duration',s:'STBY',d:'both',t:'u16',u:'sec'},
  {k:0x20,l:'Device EUI',s:'DEVEUI',d:'read',t:'hex'},
  {k:0x21,l:'App EUI',s:'APPEUI',d:'read',t:'hex'},
  {k:0x22,l:'App Key (OTAA)',s:'APPKEY',d:'write',t:'hex'},
  {k:0x23,l:'Network Session Key',s:'NWKSKEY',d:'read',t:'hex'},
  {k:0x24,l:'App Session Key',s:'APPSKEY',d:'read',t:'hex'},
  {k:0x25,l:'Device Address (ABP)',s:'DEVADDR',d:'both',t:'hex'},
  {k:0x26,l:'LoRa Region',s:'REG',d:'both',t:'u8',o:['EU433','CN470','RU864','IN865','AS923','AU915','KR920','US915','US915-HYB','AU920']},
  {k:0x27,l:'ADR Enable',s:'ADR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x28,l:'Public Network',s:'PN',d:'both',t:'u8',o:['Private','Public']},
  {k:0x29,l:'Join Mode',s:'JOINMODE',d:'both',t:'u8',o:['OTAA','ABP']},
  {k:0x2A,l:'Join Delay (RX1)',s:'JOINDLY',d:'both',t:'u8',u:'sec'},
  {k:0x2B,l:'RX2 Delay',s:'RX2DLY',d:'both',t:'u8',u:'sec'},
  {k:0x30,l:'Channel Mask',s:'CHM',d:'both',t:'hex'},
  {k:0x31,l:'Data Rate (DR)',s:'DR',d:'both',t:'u8',o:['SF12/125k','SF11/125k','SF10/125k','SF9/125k','SF8/125k','SF7/125k','SF7/250k','FSK','SF12/500k']},
  {k:0x32,l:'TX Power',s:'TXPOWER',d:'both',t:'u8',o:['Max','22dBm','20dBm','18dBm','16dBm','14dBm','12dBm','10dBm','8dBm','5dBm','2dBm']},
  {k:0x33,l:'Max Air Time',s:'MAXAIR',d:'both',t:'u16',u:'ms'},
  {k:0x34,l:'Duty Cycle Mode',s:'DC',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x35,l:'Duty Cycle Limit',s:'DCLMT',d:'both',t:'u16',u:'×10ms'},
  {k:0x36,l:'Sub-Band',s:'SUBBAND',d:'both',t:'u8',o:['All','US915-1','US915-2','AU915-1','AU915-2','AU915-3','AU915-4','AU915-5','AU915-6','AU915-7','AU915-8']},
  {k:0x40,l:'Confirmed Mode',s:'CFM',d:'both',t:'u8',o:['Unconfirmed','Confirmed']},
  {k:0x41,l:'Application Port',s:'APPPORT',d:'both',t:'u8',r:[1,223]},
  {k:0x42,l:'TX Retry Count',s:'RETRY',d:'both',t:'u8',r:[0,8]},
  {k:0x43,l:'Link Check Interval',s:'LKI',d:'both',t:'u16',u:'min'},
  {k:0x44,l:'FDR Enable',s:'FDR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x45,l:'Uplink Strategy',s:'UPSTRAT',d:'both',t:'u8',o:['Normal','Redundant','Redundant+ACK']},
  {k:0x50,l:'Auto Rejoin',s:'AJR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x51,l:'LoRa Class Mode',s:'CLASS',d:'both',t:'u8',o:['A','B','C']},
  {k:0x52,l:'Reconnect Interval',s:'RCINT',d:'both',t:'u16',u:'sec'},
  {k:0x53,l:'Link ADR Mode',s:'LADR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x54,l:'Network Check',s:'NWCHK',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x55,l:'Time Sync',s:'TIMESYNC',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x56,l:'Time Sync Interval',s:'TSINT',d:'both',t:'u16',u:'min'},
  {k:0x60,l:'GPS Enable',s:'GPS',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x61,l:'GPS Fix Timeout',s:'GPSTOUT',d:'both',t:'u8',u:'sec'},
  {k:0x62,l:'Position Strategy',s:'POSSTRAT',d:'both',t:'u8',o:['GPS Only','GPS+WiFi','WiFi Only','LBS Only','GPS+LBS','Offline GPS','BLE Beacon']},
  {k:0x63,l:'WiFi Enable',s:'WF',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x64,l:'BLE Scan Enable',s:'BLESCAN',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x65,l:'Position Report Interval',s:'POSINT',d:'both',t:'u16',u:'sec'},
  {k:0x66,l:'Motion Detect Interval',s:'MOTINT',d:'both',t:'u8',u:'sec'},
  {k:0x67,l:'Motion Detect Threshold',s:'MOTTHR',d:'both',t:'u8'},
  {k:0x68,l:'BLE Beacon UUID Filter',s:'BLEUUID',d:'both',t:'hex'},
  {k:0x70,l:'SOS Enable',s:'SOS',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x71,l:'SOS TX Interval',s:'SOSINT',d:'both',t:'u16',u:'sec'},
  {k:0x72,l:'SOS Message Count',s:'SOSCNT',d:'both',t:'u8'},
  {k:0x73,l:'SOS Battery Threshold',s:'SOSBAT',d:'both',t:'u8',u:'%'},
  {k:0x80,l:'BLE Advertising Name',s:'BLENAME',d:'both',t:'str'},
  {k:0x81,l:'BLE TX Power',s:'BLEPWR',d:'both',t:'u8',o:['+3dBm','0dBm','-6dBm','-18dBm','-40dBm']},
  {k:0x82,l:'BLE Adv Interval',s:'BLEINT',d:'both',t:'u16',u:'ms'},
  {k:0x83,l:'BLE Connect Timeout',s:'BLETMO',d:'both',t:'u16',u:'sec'},
  {k:0x84,l:'BLE Security Mode',s:'BLESEC',d:'both',t:'u8',o:['None','Passcode','Encrypted']},
  {k:0x85,l:'BLE Scan Mode',s:'BLESCANM',d:'both',t:'u8',o:['Normal','Background','Limited']},
  {k:0x86,l:'BLE Filter RSSI',s:'BLERSSI',d:'both',t:'i8',u:'dBm'},
  {k:0x87,l:'BLE Filter by Name',s:'BLEFILT',d:'both',t:'str'},
  {k:0x90,l:'Low Power Mode',s:'LP',d:'both',t:'u8',o:['Normal','Low Power']},
  {k:0x91,l:'Buzzer Enable',s:'BUZ',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x92,l:'Vibration Enable',s:'VIB',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x93,l:'LED Mode',s:'LED',d:'both',t:'u8',o:['OFF','Normal','SOS Only','Always On']},
  {k:0x94,l:'Deep Sleep Interval',s:'DSINT',d:'both',t:'u16',u:'min'},
  {k:0xF0,l:'Reboot Device',s:'REBOOT',d:'write',t:'cmd'},
  {k:0xF1,l:'Factory Reset',s:'FACTORY',d:'write',t:'cmd'},
  {k:0xF2,l:'Save Configuration',s:'SAVE',d:'write',t:'cmd'},
  {k:0xF3,l:'Change Password',s:'PWD',d:'write',t:'hex'},
  {k:0xF4,l:'Erase All Data',s:'ERASE',d:'write',t:'cmd'},
];

const SECTIONS = [
  {title:'System',keys:[0x01,0x02,0x03,0x04,0x05]},
  {title:'Work Mode',keys:[0x10,0x11,0x12,0x13]},
  {title:'LoRaWAN Keys',keys:[0x20,0x21,0x22,0x23,0x24,0x25]},
  {title:'LoRaWAN Config',keys:[0x26,0x27,0x28,0x29,0x2A,0x2B]},
  {title:'Radio',keys:[0x30,0x31,0x32,0x33,0x34,0x35,0x36]},
  {title:'Uplink',keys:[0x40,0x41,0x42,0x43,0x44,0x45]},
  {title:'Network',keys:[0x50,0x51,0x52,0x53,0x54,0x55,0x56]},
  {title:'Position',keys:[0x60,0x61,0x62,0x63,0x64,0x65,0x66,0x67,0x68]},
  {title:'SOS',keys:[0x70,0x71,0x72,0x73]},
  {title:'BLE Config',keys:[0x80,0x81,0x82,0x83,0x84,0x85,0x86,0x87]},
  {title:'Device',keys:[0x90,0x91,0x92,0x93,0x94]},
  {title:'Commands',keys:[0xF0,0xF1,0xF2,0xF3,0xF4]},
];

// ===== Styles — Industrial IoT Design Language =====
const S = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },
  safe: { backgroundColor:C.card },
  content: { flex:1 },
  scroll: { flex:1 },
  
  // Header with Logo
  header: {
    backgroundColor:C.card,
    paddingHorizontal:16, paddingVertical:12,
    borderBottomWidth:1, borderBottomColor:C.border,
    shadowColor:'#0EA5E9', shadowOpacity:0.08, shadowOffset:{width:0,height:2}, shadowRadius:8,
    elevation:2,
  },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  headerLogo: { width:36, height:36, borderRadius:8, resizeMode:'contain' },
  headerTitle: { fontSize:16, fontWeight:'800', color:C.text, letterSpacing:-0.3 },
  headerSub: { fontSize:10, color:C.muted, marginTop:1 },
  headerRight: { flexDirection:'row', alignItems:'center', gap:6 },
  
  // KPI Cards
  kpiRow: { flexDirection:'row', paddingHorizontal:12, paddingTop:12, gap:8 },
  kpiCard: {
    flex:1, backgroundColor:C.card, borderRadius:16,
    padding:14, borderWidth:1, borderColor:C.border,
    shadowColor:'#0EA5E9', shadowOpacity:0.06, shadowOffset:{width:0,height:2}, shadowRadius:8,
    minHeight:90, justifyContent:'center',
  },
  kpiIcon: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center', marginBottom:8 },
  kpiVal: { fontSize:24, fontWeight:'800', color:C.text, letterSpacing:-0.5 },
  kpiLbl: { fontSize:10, color:C.muted, marginTop:3, fontWeight:'600', textTransform:'uppercase', letterSpacing:0.5 },
  kpiTrend: { fontSize:10, color:C.success, marginTop:2, fontWeight:'700' },
  
  // Search Bar
  searchBar: {
    flexDirection:'row', alignItems:'center', marginHorizontal:16, marginTop:12,
    backgroundColor:C.card, borderRadius:12, paddingHorizontal:12, paddingVertical:10,
    borderWidth:1, borderColor:C.border,
  },
  searchInput: { flex:1, fontSize:14, color:C.text, marginLeft:8 },
  
  // Cards
  card: {
    backgroundColor:C.card, borderRadius:16, padding:16,
    marginHorizontal:16, marginVertical:6,
    borderWidth:1, borderColor:C.border,
    shadowColor:'#0EA5E9', shadowOpacity:0.04, shadowOffset:{width:0,height:2}, shadowRadius:6,
  },
  cardRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  cardName: { fontSize:15, fontWeight:'700', color:C.text },
  cardId: { fontSize:10, color:C.muted, marginTop:2, fontFamily:'monospace' },
  
  // Device Card
  devCard: {
    backgroundColor:C.card, borderRadius:16, padding:14,
    marginHorizontal:16, marginVertical:5,
    borderWidth:1, borderColor:C.border,
    shadowColor:'#0EA5E9', shadowOpacity:0.04, shadowOffset:{width:0,height:2}, shadowRadius:6,
  },
  devCardTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  devCardName: { fontSize:14, fontWeight:'700', color:C.text },
  devStatus: { flexDirection:'row', alignItems:'center', gap:4 },
  devCardMeta: { flexDirection:'row', gap:12 },
  devMetaItem: { fontSize:11, color:C.text2 },
  devCardActions: { flexDirection:'row', gap:8, marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor:C.border },
  
  // Status Dot
  statusDot: { width:8, height:8, borderRadius:4 },
  statusDotOnline: { backgroundColor:C.success },
  statusDotOffline: { backgroundColor:C.muted },
  statusDotAlert: { backgroundColor:C.danger },
  
  // Buttons
  btn: {
    backgroundColor:C.primary, paddingVertical:10, paddingHorizontal:16,
    borderRadius:12, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:6,
    shadowColor:C.primary, shadowOpacity:0.2, shadowOffset:{width:0,height:2}, shadowRadius:4,
  },
  btnW: { backgroundColor:C.primary },
  btnS: { backgroundColor:C.teal },
  btnD: { backgroundColor:C.danger },
  btnO: { backgroundColor:C.success },
  btnText: { color:'#FFFFFF', fontSize:13, fontWeight:'700' },
  smBtn: { paddingVertical:6, paddingHorizontal:12, borderRadius:8, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:4 },
  smBtnT: { fontSize:12, fontWeight:'700', color:'#FFF' },
  
  // Section Pills
  pills: { flexDirection:'row', paddingHorizontal:16, gap:8, paddingVertical:10, flexWrap:'wrap' },
  pill: { paddingHorizontal:14, paddingVertical:6, borderRadius:16, backgroundColor:C.primaryL, borderWidth:1, borderColor:C.primary },
  pillT: { fontSize:12, fontWeight:'700', color:C.primary },
  pillActive: { backgroundColor:C.primary },
  pillTActive: { color:'#FFF' },
  pillSec: { backgroundColor:C.bg, borderColor:C.border },
  pillSecT: { color:C.muted },
  
  // Console
  consoleBox: { backgroundColor:C.dark, borderRadius:16, marginHorizontal:16, padding:12, maxHeight:220 },
  consoleLine: { fontSize:11, fontFamily:'monospace', marginBottom:3 },
  consoleTX: { color:C.logTX },
  consoleRX: { color:C.logRX },
  consoleERR: { color:C.logERR },
  consoleINFO: { color:C.logINFO },
  filterRow: { flexDirection:'row', gap:8, paddingHorizontal:16, paddingVertical:8 },
  
  // Bottom Nav
  bottomNav: {
    flexDirection:'row', backgroundColor:C.card,
    borderTopWidth:1, borderTopColor:C.border,
    paddingBottom:28, paddingTop:8,
    shadowColor:'#0EA5E9', shadowOpacity:0.06, shadowOffset:{width:0,height:-2}, shadowRadius:8,
  },
  navItem: { flex:1, alignItems:'center', paddingVertical:4 },
  navIcon: { width:24, height:24, justifyContent:'center', alignItems:'center' },
  navLabel: { fontSize:10, color:C.muted, fontWeight:'700', marginTop:2 },
  navLabelA: { color:C.primary },
  navBadge: { position:'absolute', top:-2, right:'20%', backgroundColor:C.danger, borderRadius:8, paddingHorizontal:4, paddingVertical:1 },
  navBadgeT: { fontSize:9, color:'#FFF', fontWeight:'800' },
  
  // Modal
  modal: { flex:1, justifyContent:'flex-end' },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  modalBox: {
    backgroundColor:C.card, borderTopLeftRadius:24, borderTopRightRadius:24,
    padding:24, paddingBottom:40,
  },
  modalTitle: { fontSize:18, fontWeight:'800', color:C.text, marginBottom:8 },
  modalInput: {
    backgroundColor:C.bg, borderWidth:1, borderColor:C.border,
    borderRadius:12, paddingHorizontal:14, paddingVertical:12, fontSize:14, color:C.text, marginBottom:12,
  },
  
  // Param Card
  paramCard: {
    backgroundColor:C.card, borderRadius:16, padding:14,
    marginHorizontal:16, marginVertical:5, borderWidth:1, borderColor:C.border,
  },
  paramTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' },
  paramName: { fontSize:14, fontWeight:'700', color:C.text, flex:1 },
  paramCode: { fontSize:10, color:C.muted, marginTop:2 },
  paramVal: { fontSize:13, color:C.success, marginTop:6, fontWeight:'700' },
  paramPending: { color:C.warning },
  paramActions: { flexDirection:'row', gap:6, marginTop:10 },
  
  // Chart
  chartCard: {
    backgroundColor:C.card, borderRadius:16, marginHorizontal:16, marginVertical:6,
    padding:16, borderWidth:1, borderColor:C.border,
  },
  chartTitle: { fontSize:14, fontWeight:'800', color:C.text, marginBottom:12 },
  chartArea: { height:100, backgroundColor:C.primaryL, borderRadius:12, justifyContent:'center', alignItems:'center' },
  
  // Tab Filter
  tabFilter: { flexDirection:'row', paddingHorizontal:16, gap:8, paddingVertical:10 },
  tabChip: { paddingHorizontal:14, paddingVertical:6, borderRadius:10, backgroundColor:C.card, borderWidth:1, borderColor:C.border },
  tabChipA: { backgroundColor:C.primary, borderColor:C.primary },
  tabChipT: { fontSize:12, fontWeight:'700', color:C.muted },
  tabChipTA: { color:'#FFF' },
  
  // Alert Card
  alertCard: {
    backgroundColor:C.card, borderRadius:16, padding:14, marginHorizontal:16, marginVertical:5,
    borderLeftWidth:4, borderWidth:1, borderColor:C.border,
  },
  alertCardC: { borderLeftColor:C.danger },
  alertCardW: { borderLeftColor:C.warning },
  alertCardI: { borderLeftColor:C.info },
  alertRow: { flexDirection:'row', alignItems:'flex-start', gap:10 },
  alertTitle: { fontSize:14, fontWeight:'800', color:C.text },
  alertMsg: { fontSize:12, color:C.text2, marginTop:2 },
  alertTime: { fontSize:10, color:C.muted, marginTop:4 },
  
  // Section Title
  sectionTitle: {
    fontSize:11, color:C.muted, fontWeight:'800', letterSpacing:0.5,
    textTransform:'uppercase', paddingHorizontal:16, marginTop:16, marginBottom:8,
  },
});

// ===== Utility =====
const hexToBase64 = (hex: string) => {{
  const clean = hex.replace(/\s+/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  return btoa(String.fromCharCode(...bytes));
}};
const base64ToHex = (b64: string) => {{
  const bytes = atob(b64);
  return Array.from(bytes).map(b => b.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
}};
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// ===== MOCK DATA =====
const MOCK_DEVICES = [
  {{id:'AA:BB:CC:DD:EE:01',name:'Cloudtek-LW01',rssi:-65,snr:8,bat:80,online:true,last:'3s'}},
  {{id:'AA:BB:CC:DD:EE:02',name:'Cloudtek-LW02',rssi:-72,snr:6,bat:45,online:true,last:'12s'}},
  {{id:'AA:BB:CC:DD:EE:03',name:'Cloudtek-GW01',rssi:-58,snr:12,bat:95,online:true,last:'1m'}},
  {{id:'AA:BB:CC:DD:EE:04',name:'Cloudtek-LW03',rssi:-88,snr:3,bat:20,online:false,last:'2h'}},
  {{id:'AA:BB:CC:DD:EE:05',name:'Cloudtek-LW04',rssi:-95,snr:1,bat:8,online:false,last:'5h'}},
];

// ===== MAIN APP =====
export default function App() {{
  const [tab, setTab] = useState<'dashboard'|'devices'|'map'|'alerts'|'analytics'>('dashboard');
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState<'ALL'|'TX'|'RX'|'ERR'>('ALL');
  const [search, setSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState<'ALL'|'C'|'W'|'I'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [modalCmd, setModalCmd] = useState<any>(null);
  const [modalVal, setModalVal] = useState('');
  const [section, setSection] = useState(0);
  const [devValues, setDevValues] = useState<Record<number,string>>({{}});
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [connected, setConnected] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [filterDev, setFilterDev] = useState<'ALL'|'ON'|'OFF'|'ALERT'>('ALL');
  const [timeRange, setTimeRange] = useState<'1h'|'24h'|'7d'>('24h');
  const [gps, setGps] = useState<{{lat:number;lng:number}}|null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  
  const bleManagerRef = useRef<BleManager | null>(null);
  const consoleRef = useRef<FlatList>(null);
  const scanRef = useRef<Set<string>>(new Set());

  // GPS Init
  useEffect(() => {{
    Geolocation.getCurrentPosition(
      (pos: any) => {{ setGps({{ lat:pos.coords.latitude, lng:pos.coords.longitude }}); setGpsLoading(false); }},
      () => {{ setGpsLoading(false); }},
      {{ enableHighAccuracy: false, timeout: 15000 }}
    );
  }}, []);

  // BLE Init
  useEffect(() => {{
    try {{ bleManagerRef.current = new BleManager(); }} catch (e) {{ console.error('[BLE] Init failed:', e); }}
    return () => {{ bleManagerRef.current?.stopDeviceScan(); }};
  }}, []);

  // Load data
  useEffect(() => {{
    AsyncStorage.getItem(DK).then(d => {{ if(d) setDevices(JSON.parse(d)); }});
    AsyncStorage.getItem(AK).then(a => {{ if(a) setAlerts(JSON.parse(a)); }});
  }}, []);

  const addLog = (msg: string, type: 'TX'|'RX'|'ERR'|'INFO' = 'INFO') => {{
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [{{ ts, msg, type }}, ...prev].slice(0, 200));
  }};

  const filteredLogs = logs.filter(l => logFilter === 'ALL' || l.type === logFilter);

  // ===== Scan =====
  const mockScan = () => {{
    setScanning(true);
    addLog('BLE scan started...', 'INFO');
    MOCK_DEVICES.forEach((d, i) => {{
      setTimeout(() => {{
        setDevices(prev => {{
          const exists = prev.find(x => x.id === d.id);
          if (!exists) {{ const n = [...prev, d]; AsyncStorage.setItem(DK, JSON.stringify(n)); return n; }}
          return prev;
        }});
        addLog(`Found: ${{d.name}} RSSI:${{d.rssi}}dBm`, 'INFO');
        if (i === MOCK_DEVICES.length - 1) {{ setScanning(false); addLog(`Scan complete (${{MOCK_DEVICES.length}})`, 'INFO'); }}
      }}, i * 800);
    }});
  }};

  // ===== Connect =====
  const connectDevice = async (device: any) => {{
    setSelectedDevice(device);
    setConnected(true);
    setAuthed(true);
    addLog(`Connected to ${{device.name}}`, 'INFO');
    setDevValues({{
      0x01:'4.2.1', 0x02: device.id.replace(/:/g,''),
      0x03: Math.floor(Math.random()*30+60).toString(),
      0x04: device.name, 0x10:'01', 0x26:'04', 0x27:'01',
      0x31:'03', 0x32:'00', 0x60:'01', 0x80:'4D4F4B4F',
    }});
    setTimeout(() => addLog('Password verified ✓', 'INFO'), 500);
  }};

  const disconnectDevice = () => {{
    setSelectedDevice(null);
    setConnected(false);
    setAuthed(false);
    setDevValues({{}});
    setLogs([]);
    addLog('Disconnected', 'INFO');
  }};

  // ===== Params =====
  const readParam = (k: number) => {{
    setPending(prev => new Set([...prev, k]));
    addLog(`TX → READ 0x${{k.toString(16).toUpperCase().padStart(2,'0')}}`, 'TX');
    setTimeout(() => {{
      setDevValues(prev => ({{...prev, [k]: Math.floor(Math.random()*255).toString(16).toUpperCase().padStart(2,'0')}}));
      setPending(prev => {{ const n = new Set(prev); n.delete(k); return n; }});
      addLog(`RX ← 0x${{k.toString(16).toUpperCase().padStart(2,'0')}} = ??`, 'RX');
    }}, 400 + Math.random() * 400);
  }};

  const writeParam = (k: number, val: string) => {{
    setPending(prev => new Set([...prev, k]));
    addLog(`TX → WRITE 0x${{k.toString(16).toUpperCase().padStart(2,'0')}} = ${{val}}`, 'TX');
    setTimeout(() => {{
      setDevValues(prev => ({{...prev, [k]: val}}));
      setPending(prev => {{ const n = new Set(prev); n.delete(k); return n; }});
      addLog(`RX ← ACK 0x${{k.toString(16).toUpperCase().padStart(2,'0')}}`, 'RX');
    }}, 500);
  }};

  const execCmd = (k: number) => {{
    addLog(`TX → EXEC 0x${{k.toString(16).toUpperCase().padStart(2,'0')}}`, 'TX');
    setTimeout(() => addLog(`RX ← OK`, 'RX'), 300);
  }};

  // ===== Computed =====
  const onlineCount = devices.filter(d => d.online).length;
  const alertCount = alerts.length;
  const filteredDevices = devices.filter(d => {{
    if (search && !d.name?.toLowerCase().includes(search.toLowerCase()) && !d.id.includes(search)) return false;
    if (filterDev === 'ON' && !d.online) return false;
    if (filterDev === 'OFF' && d.online) return false;
    if (filterDev === 'ALERT' && (!d.bat || d.bat > 20)) return false;
    return true;
  }});

  // ===== KPI Card Component =====
  const KPICard = ({{ accent='primary', icon, value, label, trend, onClick }}: any) => (
    <TouchableOpacity style={[S.kpiCard]} onPress={{onClick}} activeOpacity={0.9}>
      <View style={[S.kpiIcon, {{backgroundColor: accent==='primary'?C.primaryL:accent==='success'?C.successL:accent==='danger'?C.dangerL:C.tealL}}]}>
        {{icon}}
      </View>
      <Text style={S.kpiVal}>{{value}}</Text>
      <Text style={S.kpiLbl}>{{label}}</Text>
      {{trend && <Text style={S.kpiTrend}>{{trend}}</Text>}}
    </TouchableOpacity>
  );

  // ===== Status Dot =====
  const StatusDot = ({{ online, alert }}: {{online:boolean, alert?:boolean}}) => (
    <View style={[S.statusDot, alert ? S.statusDotAlert : online ? S.statusDotOnline : S.statusDotOffline]} />
  );

  // ===== Dashboard Tab =====
  const DashboardTab = () => (
    <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
      <View style={S.kpiRow}>
        <KPICard accent="primary" icon={{<Ico.Radio s={{C.primary}} />}} value={{devices.length}} label="DEVICES" trend="+2 new" onClick={{() => setTab('devices')}} />
        <KPICard accent="success" icon={{<Ico.Check s={{C.success}} />}} value={{onlineCount}} label="ONLINE" />
        <KPICard accent="danger" icon={{<Ico.Alert s={{C.danger}} />}} value={{alertCount}} label="ALERTS" />
        <KPICard accent="teal" icon={{<Ico.Signal s={{C.teal}} />}} value="4.2MB" label="DATA" trend="+12%" />
      </View>
      
      <Text style={S.sectionTitle}>Signal Trend</Text>
      <View style={S.chartCard}>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:12}}>
          <Text style={S.chartTitle}>RSSI / SNR</Text>
          <View style={{flexDirection:'row', gap:8}}>
            {{(['1h','24h','7d'] as const).map(t => (
              <TouchableOpacity key={{t}} onPress={{() => setTimeRange(t)}} style={[S.tabChip, timeRange===t && S.tabChipA]}>
                <Text style={[S.tabChipT, timeRange===t && S.tabChipTA]}>{{t}}</Text>
              </TouchableOpacity>
            ))}}
          </View>
        </View>
        <View style={S.chartArea}>
          <Text style={{fontSize:12, color:C.muted}}>📈 Line Chart Placeholder</Text>
          <Text style={{fontSize:11, color:C.muted, marginTop:4}}>Avg: -68 dBm | Max: -55 dBm | Min: -82 dBm</Text>
        </View>
      </View>
      
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, marginTop:8}}>
        <Text style={S.sectionTitle}>Devices</Text>
        <TouchableOpacity onPress={{() => setTab('devices')}}><Text style={{fontSize:12, color:C.primary, fontWeight:'700'}}>View all →</Text></TouchableOpacity>
      </View>
      {{filteredDevices.slice(0, 3).map(d => (
        <TouchableOpacity key={{d.id}} style={S.devCard} onPress={{() => {{ connectDevice(d); setTab('devices'); }}}}>
          <View style={S.devCardTop}>
            <View style={{flex:1}}>
              <Text style={S.devCardName}>{{d.name}}</Text>
              <Text style={S.cardId}>{{d.id}}</Text>
            </View>
            <View style={S.devStatus}>
              <StatusDot online={{d.online}} alert={{d.bat < 20}} />
              <Text style={{fontSize:11, color: d.online ? C.success : d.bat < 20 ? C.danger : C.muted, fontWeight:'700'}}>
                {{d.online ? 'ONLINE' : d.bat < 20 ? 'ALERT' : 'OFFLINE'}}
              </Text>
            </View>
          </View>
          <View style={S.devCardMeta}>
            <Text style={S.devMetaItem}>📶 {{d.rssi}} dBm</Text>
            <Text style={S.devMetaItem}>🔋 {{d.bat}}%</Text>
            <Text style={S.devMetaItem}>⏱ {{d.last}}</Text>
          </View>
        </TouchableOpacity>
      ))}}
      <View style={{height:80}} />
    </ScrollView>
  );

  // ===== Devices Tab =====
  const DevicesTab = () => (
    <View style={S.root}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.searchBar}>
          <Ico.Search />
          <TextInput style={S.searchInput} placeholder="Search devices..." placeholderTextColor={{C.muted}} value={{search}} onChangeText={{setSearch}} />
          {{scanning && <ActivityIndicator size="small" color={{C.primary}} />}}
        </View>
        
        <View style={S.pills}>
          {{[['ALL','All'],['ON','Online'],['OFF','Offline'],['ALERT','Alert']].map(([k,v]) => (
            <TouchableOpacity key={{k}} style={[S.pill, filterDev===k && S.pillActive, filterDev!==k && S.pillSec]} onPress={{() => setFilterDev(k as any)}}>
              <Text style={[S.pillT, filterDev===k && S.pillTActive, filterDev!==k && S.pillSecT]}>{{v}}</Text>
            </TouchableOpacity>
          ))}}
          <TouchableOpacity style={[S.pill, {{backgroundColor:C.success}}]} onPress={{mockScan}} disabled={{scanning}}>
            <Text style={[S.pillT, {{color:'#fff'}}]}>{{scanning ? 'Scanning...' : 'Scan'}}</Text>
          </TouchableOpacity>
        </View>
        
        {{filteredDevices.map(d => (
          <TouchableOpacity key={{d.id}} style={S.devCard} onPress={{() => connectDevice(d)}}>
            <View style={S.devCardTop}>
              <View style={{flex:1}}>
                <Text style={S.devCardName}>{{d.name}}</Text>
                <Text style={S.cardId}>{{d.id}}</Text>
              </View>
              <View style={S.devStatus}>
                <StatusDot online={{d.online}} alert={{d.bat < 20}} />
                <Text style={{fontSize:11, color: d.online ? C.success : C.muted, fontWeight:'700'}}>{{d.online ? 'ONLINE' : 'OFFLINE'}}</Text>
              </View>
            </View>
            <View style={S.devCardMeta}>
              <Text style={S.devMetaItem}>📶 {{d.rssi || '—'}} dBm</Text>
              <Text style={S.devMetaItem}>🔋 {{d.bat || '—'}}%</Text>
              <Text style={S.devMetaItem}>⏱ {{d.last}}</Text>
            </View>
          </TouchableOpacity>
        ))}}
        <View style={{height:80}} />
      </ScrollView>
    </View>
  );

  // ===== Device Detail =====
  const DeviceDetailTab = () => {{
    if (!selectedDevice) return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{fontSize:48, marginBottom:16}}>⚙️</Text>
        <Text style={{fontSize:16, color:C.text2, fontWeight:'700'}}>Select a device</Text>
        <TouchableOpacity style={[S.btn, {{marginTop:24, width:200}}]} onPress={{() => setTab('devices')}}>
          <Text style={S.btnText}>Go to Devices</Text>
        </TouchableOpacity>
      </View>
    );
    
    const currentSection = SECTIONS[section];
    
    return (
      <View style={S.root}>
        <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
          <View style={S.header}>
            <View style={S.headerRow}>
              <TouchableOpacity onPress={{disconnectDevice}}>
                <Text style={{color:C.primary, fontSize:13, fontWeight:'700'}}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={{disconnectDevice}}>
                <Text style={{color:C.danger, fontSize:13, fontWeight:'800'}}>Disconnect</Text>
              </TouchableOpacity>
            </View>
            <Text style={{fontSize:18, fontWeight:'800', color:C.text, marginTop:8}}>{{selectedDevice.name}}</Text>
            <Text style={{fontSize:11, color:C.muted}}>{{selectedDevice.id}}</Text>
          </View>
          
          <View style={{flexDirection:'row', paddingHorizontal:12, paddingVertical:10, gap:8}}>
            {{[['Status', connected?'Online':'Offline', connected?C.success:C.muted], ['Auth', authed?'Verified':'Pending', authed?C.success:C.warning], ['Battery', `${{devValues[0x03]||'?'}}%`, C.success], ['Pending', `${{pending.size}}`, C.primary]].map(([l,v,c]) => (
              <View key={{l}} style={{flex:1, backgroundColor:C.bg, borderRadius:12, padding:12, alignItems:'center'}}>
                <Text style={{fontSize:16, fontWeight:'800', color:c as string}}>{{v}}</Text>
                <Text style={{fontSize:10, color:C.muted, marginTop:2, fontWeight:'700'}}>{{l}}</Text>
              </View>
            ))}}
          </View>
          
          <View style={{flexDirection:'row', paddingHorizontal:16, gap:8, marginTop:4, marginBottom:8}}>
            <TouchableOpacity style={[S.smBtn, S.btnW]} onPress={{() => CMDS.slice(0,4).forEach(c => readParam(c.k))}}>
              <Text style={S.smBtnT}>Read All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, S.btnS]} onPress={{() => execCmd(0xF2)}}>
              <Text style={S.smBtnT}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, {{backgroundColor:C.muted}}]} onPress={{() => execCmd(0xF0)}}>
              <Text style={S.smBtnT}>Reboot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, S.btnD]} onPress={{() => execCmd(0xF1)}}>
              <Text style={S.smBtnT}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <View style={S.pills}>
            {{SECTIONS.map((sec, i) => (
              <TouchableOpacity key={{sec.title}} style={[S.pill, section===i && S.pillActive, section!==i && S.pillSec]} onPress={{() => setSection(i)}}>
                <Text style={[S.pillT, section===i && S.pillTActive, section!==i && S.pillSecT]}>{{sec.title}}</Text>
              </TouchableOpacity>
            ))}}
          </View>
          
          {{currentSection.keys.map(k => {{
            const cmd = CMDS.find(c => c.k === k);
            if (!cmd) return null;
            const val = devValues[cmd.k];
            const p = pending.has(cmd.k);
            const display = val ? (cmd.o ? cmd.o[parseInt(val, 16)] || val : val) : '—';
            return (
              <View key={{cmd.k}} style={[S.paramCard, p && {{borderLeftWidth:4, borderLeftColor:C.warning}}]}>
                <View style={S.paramTop}>
                  <View style={{flex:1}}>
                    <Text style={S.paramName}>{{cmd.l}}</Text>
                    <Text style={S.paramCode}>{{cmd.s}} · 0x{{cmd.k.toString(16).toUpperCase().padStart(2,'0')}} · {{cmd.d}}</Text>
                  </View>
                  <Text style={[S.paramVal, p && S.paramPending]}>{{p ? '⏳' : ''}}{{display}}</Text>
                </View>
                <View style={S.paramActions}>
                  {{cmd.d !== 'write' && (
                    <TouchableOpacity style={[S.smBtn, {{backgroundColor:C.muted}}]} onPress={{() => readParam(cmd.k)}}>
                      <Text style={S.smBtnT}>Read</Text>
                    </TouchableOpacity>
                  )}}
                  {{cmd.d !== 'read' && cmd.t !== 'cmd' && (
                    <TouchableOpacity style={[S.smBtn, S.btnW]} onPress={{() => {{ setModalCmd(cmd); setModalVal(val || ''); setShowModal(true); }}}}>
                      <Text style={S.smBtnT}>Write</Text>
                    </TouchableOpacity>
                  )}}
                  {{cmd.t === 'cmd' && (
                    <TouchableOpacity style={[S.smBtn, S.btnD]} onPress={{() => execCmd(cmd.k)}}>
                      <Text style={S.smBtnT}>Run</Text>
                    </TouchableOpacity>
                  )}}
                </View>
              </View>
            );
          }})}}
          
          <Text style={S.sectionTitle}>Console</Text>
          <View style={S.filterRow}>
            {{[['ALL','All'],['TX','TX'],['RX','RX'],['ERR','ERR']].map(([k,v]) => (
              <TouchableOpacity key={{k}} style={[S.tabChip, logFilter===k && S.tabChipA]} onPress={{() => setLogFilter(k as any)}}>
                <Text style={[S.tabChipT, logFilter===k && S.tabChipTA]}>{{v}}</Text>
              </TouchableOpacity>
            ))}}
            <View style={{flex:1}} />
            <TouchableOpacity onPress={{() => setLogs([])}}>
              <Text style={{fontSize:12, color:C.muted}}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={S.consoleBox}>
            <FlatList
              ref={{consoleRef}}
              data={{filteredLogs}}
              inverted
              keyExtractor={{(_, i) => i.toString()}}
              renderItem={{({{ item }}) => (
                <Text style={[S.consoleLine, item.type==='TX'&&S.consoleTX, item.type==='RX'&&S.consoleRX, item.type==='ERR'&&S.consoleERR]}>
                  [{{item.ts}}] {{item.type==='TX'?'→':item.type==='RX'?'←':'·'}} {{item.msg}}
                </Text>
              )}}
              ListEmptyComponent={{<Text style={{color:C.muted, textAlign:'center', padding:20}}>— No logs —</Text>}}
            />
          </View>
          <View style={{height:100}} />
        </ScrollView>
      </View>
    );
  }};

  // ===== Alerts Tab =====
  const AlertsTab = () => (
    <View style={S.root}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.tabFilter}>
          {{[['ALL','All'],['C','Critical'],['W','Warning'],['I','Info']].map(([k,v]) => (
            <TouchableOpacity key={{k}} style={[S.tabChip, alertFilter===k && S.tabChipA]} onPress={{() => setAlertFilter(k as any)}}>
              <Text style={[S.tabChipT, alertFilter===k && S.tabChipTA]}>{{v}}</Text>
            </TouchableOpacity>
          ))}}
        </View>
        {{[
          {{id:1,type:'C',title:'Cloudtek-LW04 — Battery Critical',msg:'Battery: 8%',time:'08:23'}},
          {{id:2,type:'W',title:'Cloudtek-LW03 — Signal Weak',msg:'RSSI: -88 dBm',time:'07:45'}},
          {{id:3,type:'I',title:'Cloudtek-LW01 — Reconnected',msg:'Back online',time:'06:30'}},
        ].map(a => (
          <View key={{a.id}} style={[S.alertCard, a.type==='C'&&S.alertCardC, a.type==='W'&&S.alertCardW, a.type==='I'&&S.alertCardI]}>
            <View style={S.alertRow}>
              <Text style={{fontSize:20}}>{{a.type==='C'?'🔴':a.type==='W'?'🟡':'🔵'}}</Text>
              <View style={{flex:1}}>
                <Text style={S.alertTitle}>{{a.title}}</Text>
                <Text style={S.alertMsg}>{{a.msg}}</Text>
                <Text style={S.alertTime}>{{a.time}}</Text>
              </View>
            </View>
          </View>
        ))}}
        <View style={{height:80}} />
      </ScrollView>
    </View>
  );

  // ===== Analytics Tab =====
  const AnalyticsTab = () => (
    <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
      <View style={S.tabFilter}>
        {{[['1h','1H'],['24h','24H'],['7d','7D'],['30d','30D']].map(([k,v]) => (
          <TouchableOpacity key={{k}} style={[S.tabChip, timeRange===k && S.tabChipA]} onPress={{() => setTimeRange(k as any)}}>
            <Text style={[S.tabChipT, timeRange===k && S.tabChipTA]}>{{v}}</Text>
          </TouchableOpacity>
        ))}}
      </View>
      <Text style={S.sectionTitle}>RSSI Signal Strength</Text>
      <View style={S.chartCard}>
        <View style={S.chartArea}>
          <Text style={{fontSize:14, fontWeight:'700', color:C.text}}>Avg RSSI: -72 dBm</Text>
        </View>
      </View>
      <Text style={S.sectionTitle}>Battery Trend</Text>
      <View style={S.chartCard}>
        <View style={S.chartArea}>
          <Text style={{fontSize:14, fontWeight:'700', color:C.text}}>Avg: 68%</Text>
        </View>
      </View>
      <View style={{height:80}} />
    </ScrollView>
  );

  // ===== Map Tab =====
  const MapTab = () => {{
    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${{GOOGLE_MAPS_API_KEY}}&center=${{gps?.lat ?? 25.033}},${{gps?.lng ?? 121.565}}&zoom=14`;
    return (
      <View style={{flex:1}}>
        <View style={{padding:12, backgroundColor:C.card, borderBottomWidth:1, borderBottomColor:C.border}}>
          <Text style={{fontSize:16, fontWeight:'800', color:C.primary}}>Device Map</Text>
          <Text style={{fontSize:12, color:C.muted, marginTop:4}}>
            <Ico.Pin /> {{gps ? `${{gps.lat.toFixed(4)}}, ${{gps.lng.toFixed(4)}}` : 'Locating...'}} · {{filteredDevices.length}} devices
          </Text>
        </View>
        <View style={{flex:1, margin:8, borderRadius:16, overflow:'hidden', borderWidth:1, borderColor:C.border}}>
          <WebView source={{uri: mapUrl}} style={{flex:1}} />
        </View>
      </View>
    );
  }};

  // ===== Bottom Nav =====
  const NAV = [
    {{ key: 'dashboard', label: 'Home', icon: <Ico.Home /> }},
    {{ key: 'devices', label: 'Devices', icon: <Ico.Device /> }},
    {{ key: 'map', label: 'Map', icon: <Ico.Map /> }},
    {{ key: 'alerts', label: 'Alerts', icon: <Ico.Bell />, badge: alertCount }},
    {{ key: 'analytics', label: 'Stats', icon: <Ico.Chart /> }},
  ];

  // ===== Modal =====
  const ModalContent = () => {{
    if (!modalCmd) return null;
    return (
      <View style={S.modalOverlay}>
        <TouchableOpacity style={{flex:1}} onPress={{() => setShowModal(false)}} />
        <View style={S.modalBox}>
          <Text style={S.modalTitle}>Write: {{modalCmd.l}}</Text>
          <Text style={{fontSize:12, color:C.muted, marginBottom:16}}>{{modalCmd.s}} · 0x{{modalCmd.k.toString(16).toUpperCase()}}</Text>
          {{modalCmd.o ? (
            <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
              {{modalCmd.o.map((opt: string, i: number) => (
                <TouchableOpacity key={{i}} style={[S.pill, S.pillActive]} onPress={{() => {{ writeParam(modalCmd.k, i.toString(16).toUpperCase().padStart(2,'0')); setShowModal(false); }}}}>
                  <Text style={{color:'#fff', fontSize:12, fontWeight:'700'}}>{{opt}}</Text>
                </TouchableOpacity>
              ))}}
            </View>
          ) : (
            <>
              <TextInput style={S.modalInput} value={{modalVal}} onChangeText={{setModalVal}} placeholder="Value (HEX)" placeholderTextColor={{C.muted}} autoFocus />
              <TouchableOpacity style={S.btn} onPress={{() => {{ writeParam(modalCmd.k, modalVal); setShowModal(false); }}}}>
                <Text style={S.btnText}>Write</Text>
              </TouchableOpacity>
            </>
          )}}
          <TouchableOpacity onPress={{() => setShowModal(false)}} style={{marginTop:12}}>
            <Text style={{textAlign:'center', color:C.muted, fontSize:14}}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }};

  // ===== Render Tab =====
  const renderTab = () => {{
    if (selectedDevice && (tab === 'devices' || tab === 'dashboard')) return DeviceDetailTab();
    switch (tab) {{
      case 'dashboard': return DashboardTab();
      case 'devices': return DevicesTab();
      case 'map': return MapTab();
      case 'alerts': return AlertsTab();
      case 'analytics': return AnalyticsTab();
      default: return DashboardTab();
    }}
  }};

  return (
    <SafeAreaView style={S.root}>
      {/* Header with CloudTek Logo */}
      <View style={S.header}>
        <View style={S.headerRow}>
          <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
            <Image source={{CLOUDTEK_LOGO}} style={S.headerLogo} />
            <View>
              <Text style={S.headerTitle}>LoRaTool</Text>
              <Text style={S.headerSub}>v10.0 · CloudTek IoT</Text>
            </View>
          </View>
          <View style={S.headerRight}>
            {{gpsLoading ? (
              <Text style={{fontSize:11, color:C.muted}}>Locating...</Text>
            ) : gps ? (
              <Text style={{fontSize:10, color:C.success, fontWeight:'700'}}>
                <Ico.Pin s={{C.success}} /> {{gps.lat.toFixed(3)}}, {{gps.lng.toFixed(3)}}
              </Text>
            ) : (
              <Text style={{fontSize:11, color:C.danger}}>No GPS</Text>
            )}}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={{flex:1}}>
        {{renderTab()}}
      </View>

      {/* Bottom Nav */}
      <View style={S.bottomNav}>
        {{NAV.map(item => (
          <TouchableOpacity key={{item.key}} style={S.navItem} onPress={{() => {{ if(item.key !== 'devices') setSelectedDevice(null); setTab(item.key as any); }}}}>
            <View style={[S.navIcon, tab===item.key && {{borderBottomWidth:2, borderBottomColor:C.primary, paddingBottom:2}}]}>
              {{item.icon}}
            </View>
            <Text style={[S.navLabel, tab === item.key && S.navLabelA]}>{{item.label}}</Text>
            {{item.badge && item.badge > 0 && (
              <View style={S.navBadge}>
                <Text style={S.navBadgeT}>{{item.badge}}</Text>
              </View>
            )}}
          </TouchableOpacity>
        ))}}
      </View>

      {/* Modal */}
      {{showModal && <ModalContent />}}
    </SafeAreaView>
  );
}}
