/**
 * LoRaTool v9 - SaaS UI Reconstruction
 * Based on: UIdesign.md + docx_text.txt
 * 
 * Architecture:
 * - Dashboard (KPI Cards + Chart + Device List)
 * - Devices (Search + Filter + List)
 * - Device Detail (Single Device Workspace)
 * - Alerts (Critical/Warning/Info)
 * - Analytics (RSSI/Battery Charts)
 * 
 * Design: SaaS Light (Stripe/Vercel/Notion)
 * Colors: Primary=#2563EB, Success=#16A34A, Danger=#DC2626, Warning=#F59E0B
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  Alert, PermissionsAndroid, Platform, TextInput,
  Modal, ActivityIndicator, SafeAreaView, Dimensions,
} from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { WebView } from 'react-native-webview';

// ===== Google Maps Configuration =====
const GOOGLE_MAPS_API_KEY = 'AIzaSyD5ICP2AXbHVCYFLGuNLxj-5dmq2BgDuMM';

// ===== Pure JS AsyncStorage (bypasses native module crashes on RN 0.84) =====
const _storage = new Map<string, string>();
const AsyncStorage = {
  getItem: (key: string): Promise<string | null> => Promise.resolve(_storage.get(key) ?? null),
  setItem: (key: string, value: string): Promise<void> => { _storage.set(key, value); return Promise.resolve(); },
  removeItem: (key: string): Promise<void> => { _storage.delete(key); return Promise.resolve(); },
  clear: (): Promise<void> => { _storage.clear(); return Promise.resolve(); },
};

// ===== Mock Geolocation (bypasses native module crashes on RN 0.84) =====
// Returns a fake Taiwan location for demo; user can update manually
const Geolocation = {
  getCurrentPosition: (success: Function, error?: Function, options?: any) => {
    // Simulate GPS with a default Taiwan location
    success({ coords: { latitude: 25.0330, longitude: 121.5654, accuracy: 10 } });
  },
  watchPosition: (success: Function, error?: Function, options?: any) => 1,
  clearWatch: (id: number) => {},
  stopObserving: () => {},
};

// ===== Constants =====
// NOTE: Do NOT initialize BleManager at module level - it crashes if native modules aren't ready
// bleManager will be initialized inside App() via useRef
const DK = 'lora_devices_v9';
const AK = 'lora_alerts_v9';
const PWD = 'cloudtek';
const { width: SCREEN_W } = Dimensions.get('window');

// ===== BLE UUIDs (from MKLoRa SDK - OrderServices.java / OrderCHAR.java) =====
// Service UUID for LoRa BLE communication
const SERVICE_UUID = '0000AA00-0000-1000-8000-00805F9B34FB';
// Characteristic UUIDs
const CHAR_PASSWORD_UUID = '0000AA00-0000-1000-8000-00805F9B34FB';      // 写入密码
const CHAR_DISCONNECT_UUID = '0000AA01-0000-1000-8000-00805F9B34FB';    // 断开通知
const CHAR_WRITE_UUID = '0000AA02-0000-1000-8000-00805F9B34FB';         // 参数读写 (CHAR_PARAMS)
const CHAR_NOTIFY_UUID = '0000AA02-0000-1000-8000-00805F9B34FB';        // 同上，用于通知
const CHAR_STORAGE_UUID = '0000AA04-0000-1000-8000-00805F9B34FB';       // 存储数据通知
const CHAR_LOG_UUID = '0000AA05-0000-1000-8000-00805F9B34FB';           // 日志
// Alternative naming (aliases for compatibility)
const VCHAR_WRITE_UUID = CHAR_WRITE_UUID;
const CHAR_PARAMS_UUID = CHAR_WRITE_UUID;

// ===== SaaS Design Tokens (UIdesign.md) =====
const C = {
  // Primary
  primary:    '#2563EB',
  primaryH:   '#1D4ED8',
  primaryL:   '#EFF6FF',
  // Status
  success:    '#16A34A',
  successL:   '#DCFCE7',
  warning:    '#F59E0B',
  warningL:   '#FEF3C7',
  danger:     '#DC2626',
  dangerL:    '#FEE2E2',
  info:       '#0EA5E9',
  infoL:      '#E0F2FE',
  // Text
  text:       '#0F172A',
  text2:      '#334155',
  muted:      '#64748B',
  disabled:   '#94A3B8',
  // Background
  bg:         '#F1F5F9',
  card:       '#FFFFFF',
  dark:       '#1C2128',
  // Border
  border:     '#E2E8F0',
  borderD:    '#CBD5E1',
  // Console
  logTX:      '#3FB950',
  logRX:      '#58A6FF',
  logERR:     '#F85149',
  logINFO:    '#8B949E',
};

// ===== LoRa Commands (52 keys) =====
const CMDS = [
  // === System Info ===
  {k:0x01,l:'Firmware Version',s:'VER',d:'read',t:'hex'},
  {k:0x02,l:'MAC Address',s:'MAC',d:'read',t:'hex'},
  {k:0x03,l:'Battery Level',s:'BAT',d:'read',t:'u8',o:['0-100%']},
  {k:0x04,l:'Device Name',s:'NAME',d:'both',t:'str'},
  {k:0x05,l:'Hardware Version',s:'HW',d:'read',t:'hex'},
  // === Work Mode ===
  {k:0x10,l:'Work Mode',s:'MODE',d:'both',t:'u8',o:['Standby','Periodic','Timing','Motion']},
  {k:0x11,l:'Heartbeat Interval',s:'HBT',d:'both',t:'u16',u:'sec',r:[5,3600]},
  {k:0x12,l:'Time Zone Offset',s:'TZ',d:'both',t:'i8',u:'×15min'},
  {k:0x13,l:'Standby Duration',s:'STBY',d:'both',t:'u16',u:'sec'},
  // === LoRaWAN Keys ===
  {k:0x20,l:'Device EUI',s:'DEVEUI',d:'read',t:'hex'},
  {k:0x21,l:'App EUI',s:'APPEUI',d:'read',t:'hex'},
  {k:0x22,l:'App Key (OTAA)',s:'APPKEY',d:'write',t:'hex'},
  {k:0x23,l:'Network Session Key',s:'NWKSKEY',d:'read',t:'hex'},
  {k:0x24,l:'App Session Key',s:'APPSKEY',d:'read',t:'hex'},
  {k:0x25,l:'Device Address (ABP)',s:'DEVADDR',d:'both',t:'hex'},
  {k:0x26,l:'LoRa Region',s:'REG',d:'both',t:'u8',o:['EU433','CN470','RU864','IN865','AS923','AU915','KR920','US915','US915-HYB','AU920']},
  // === LoRaWAN Config ===
  {k:0x27,l:'ADR Enable',s:'ADR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x28,l:'Public Network',s:'PN',d:'both',t:'u8',o:['Private','Public']},
  {k:0x29,l:'Join Mode',s:'JOINMODE',d:'both',t:'u8',o:['OTAA','ABP']},
  {k:0x2A,l:'Join Delay (RX1)',s:'JOINDLY',d:'both',t:'u8',u:'sec'},
  {k:0x2B,l:'RX2 Delay',s:'RX2DLY',d:'both',t:'u8',u:'sec'},
  // === Radio Parameters ===
  {k:0x30,l:'Channel Mask',s:'CHM',d:'both',t:'hex'},
  {k:0x31,l:'Data Rate (DR)',s:'DR',d:'both',t:'u8',o:['SF12/125k','SF11/125k','SF10/125k','SF9/125k','SF8/125k','SF7/125k','SF7/250k','FSK','SF12/500k']},
  {k:0x32,l:'TX Power',s:'TXPOWER',d:'both',t:'u8',o:['Max','22dBm','20dBm','18dBm','16dBm','14dBm','12dBm','10dBm','8dBm','5dBm','2dBm']},
  {k:0x33,l:'Max Air Time',s:'MAXAIR',d:'both',t:'u16',u:'ms'},
  {k:0x34,l:'Duty Cycle Mode',s:'DC',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x35,l:'Duty Cycle Limit',s:'DCLMT',d:'both',t:'u16',u:'×10ms'},
  {k:0x36,l:'Sub-Band',s:'SUBBAND',d:'both',t:'u8',o:['All','US915-1','US915-2','AU915-1','AU915-2','AU915-3','AU915-4','AU915-5','AU915-6','AU915-7','AU915-8']},
  // === Uplink Config ===
  {k:0x40,l:'Confirmed Mode',s:'CFM',d:'both',t:'u8',o:['Unconfirmed','Confirmed']},
  {k:0x41,l:'Application Port',s:'APPPORT',d:'both',t:'u8',r:[1,223]},
  {k:0x42,l:'TX Retry Count',s:'RETRY',d:'both',t:'u8',r:[0,8]},
  {k:0x43,l:'Link Check Interval',s:'LKI',d:'both',t:'u16',u:'min'},
  {k:0x44,l:'FDR Enable',s:'FDR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x45,l:'Uplink Strategy',s:'UPSTRAT',d:'both',t:'u8',o:['Normal','Redundant','Redundant+ACK']},
  // === Network Config ===
  {k:0x50,l:'Auto Rejoin',s:'AJR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x51,l:'LoRa Class Mode',s:'CLASS',d:'both',t:'u8',o:['A','B','C']},
  {k:0x52,l:'Reconnect Interval',s:'RCINT',d:'both',t:'u16',u:'sec'},
  {k:0x53,l:'Link ADR Mode',s:'LADR',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x54,l:'Network Check',s:'NWCHK',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x55,l:'Time Sync',s:'TIMESYNC',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x56,l:'Time Sync Interval',s:'TSINT',d:'both',t:'u16',u:'min'},
  // === Position Config ===
  {k:0x60,l:'GPS Enable',s:'GPS',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x61,l:'GPS Fix Timeout',s:'GPSTOUT',d:'both',t:'u8',u:'sec'},
  {k:0x62,l:'Position Strategy',s:'POSSTRAT',d:'both',t:'u8',o:['GPS Only','GPS+WiFi','WiFi Only','LBS Only','GPS+LBS','Offline GPS','BLE Beacon']},
  {k:0x63,l:'WiFi Enable',s:'WF',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x64,l:'BLE Scan Enable',s:'BLESCAN',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x65,l:'Position Report Interval',s:'POSINT',d:'both',t:'u16',u:'sec'},
  {k:0x66,l:'Motion Detect Interval',s:'MOTINT',d:'both',t:'u8',u:'sec'},
  {k:0x67,l:'Motion Detect Threshold',s:'MOTTHR',d:'both',t:'u8'},
  {k:0x68,l:'BLE Beacon UUID Filter',s:'BLEUUID',d:'both',t:'hex'},
  // === SOS Config ===
  {k:0x70,l:'SOS Enable',s:'SOS',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x71,l:'SOS TX Interval',s:'SOSINT',d:'both',t:'u16',u:'sec'},
  {k:0x72,l:'SOS Message Count',s:'SOSCNT',d:'both',t:'u8'},
  {k:0x73,l:'SOS Battery Threshold',s:'SOSBAT',d:'both',t:'u8',u:'%'},
  // === BLE Config ===
  {k:0x80,l:'BLE Advertising Name',s:'BLENAME',d:'both',t:'str'},
  {k:0x81,l:'BLE TX Power',s:'BLEPWR',d:'both',t:'u8',o:['+3dBm','0dBm','-6dBm','-18dBm','-40dBm']},
  {k:0x82,l:'BLE Adv Interval',s:'BLEINT',d:'both',t:'u16',u:'ms'},
  {k:0x83,l:'BLE Connect Timeout',s:'BLETMO',d:'both',t:'u16',u:'sec'},
  {k:0x84,l:'BLE Security Mode',s:'BLESEC',d:'both',t:'u8',o:['None','Passcode','Encrypted']},
  {k:0x85,l:'BLE Scan Mode',s:'BLESCANM',d:'both',t:'u8',o:['Normal','Background','Limited']},
  {k:0x86,l:'BLE Filter RSSI',s:'BLERSSI',d:'both',t:'i8',u:'dBm'},
  {k:0x87,l:'BLE Filter by Name',s:'BLEFILT',d:'both',t:'str'},
  // === Device Config ===
  {k:0x90,l:'Low Power Mode',s:'LP',d:'both',t:'u8',o:['Normal','Low Power']},
  {k:0x91,l:'Buzzer Enable',s:'BUZ',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x92,l:'Vibration Enable',s:'VIB',d:'both',t:'u8',o:['OFF','ON']},
  {k:0x93,l:'LED Mode',s:'LED',d:'both',t:'u8',o:['OFF','Normal','SOS Only','Always On']},
  {k:0x94,l:'Deep Sleep Interval',s:'DSINT',d:'both',t:'u16',u:'min'},
  // === Commands ===
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

// ===== Styles (SaaS Design) =====
const S = StyleSheet.create({
  // Layout
  root: { flex:1, backgroundColor:C.bg },
  safe: { backgroundColor:C.card },
  content: { flex:1 },
  scroll: { flex:1 },

  // Header
  header: {
    backgroundColor:C.card,
    paddingHorizontal:16, paddingVertical:14,
    borderBottomWidth:1, borderBottomColor:C.border,
    shadowColor:'#000', shadowOpacity:0.04, shadowOffset:{width:0,height:2}, shadowRadius:8,
  },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  headerLogo: { fontSize:20, fontWeight:'700', color:C.primary },
  headerSub: { fontSize:11, color:C.muted, marginTop:2 },
  headerTitle: { fontSize:18, fontWeight:'700', color:C.text },
  headerSub2: { fontSize:11, color:C.muted, marginTop:1 },
  headerRight: { alignItems:'flex-end' },

  // KPI Cards (Dashboard)
  kpiRow: { flexDirection:'row', paddingHorizontal:12, paddingTop:12, gap:8 },
  kpiCard: {
    flex:1, backgroundColor:C.card, borderRadius:16,
    padding:14, borderWidth:1, borderColor:C.border,
    shadowColor:'#000', shadowOpacity:0.06, shadowOffset:{width:0,height:2}, shadowRadius:8,
    minHeight:90, justifyContent:'center',
  },
  kpiIcon: { fontSize:22, marginBottom:6 },
  kpiVal: { fontSize:24, fontWeight:'700', color:C.primary },
  kpiValOk: { color:C.success },
  kpiValErr: { color:C.danger },
  kpiLbl: { fontSize:11, color:C.muted, marginTop:3 },
  kpiTrend: { fontSize:11, color:C.success, marginTop:2, fontWeight:'600' },

  // Search Bar
  searchBar: {
    flexDirection:'row', alignItems:'center', marginHorizontal:16, marginTop:12,
    backgroundColor:C.bg, borderRadius:12, paddingHorizontal:14, paddingVertical:10,
    borderWidth:1, borderColor:C.border,
  },
  searchInput: { flex:1, fontSize:14, color:C.text, marginLeft:8 },

  // Section Title
  sectionTitle: {
    fontSize:11, color:C.muted, fontWeight:'700', letterSpacing:1,
    textTransform:'uppercase', paddingHorizontal:16, marginTop:20, marginBottom:8,
  },

  // Cards (SaaS: 16px radius, shadow)
  card: {
    backgroundColor:C.card, borderRadius:16, padding:16,
    marginHorizontal:16, marginVertical:6,
    borderWidth:1, borderColor:C.border,
    shadowColor:'#000', shadowOpacity:0.06, shadowOffset:{width:0,height:2}, shadowRadius:8,
  },
  cardRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  cardName: { fontSize:16, fontWeight:'700', color:C.text },
  cardId: { fontSize:10, color:C.muted, marginTop:3, fontFamily:'monospace' },

  // Device Card (Dashboard)
  devCard: {
    backgroundColor:C.card, borderRadius:16, padding:14,
    marginHorizontal:16, marginVertical:5,
    borderWidth:1, borderColor:C.border,
    shadowColor:'#000', shadowOpacity:0.06, shadowOffset:{width:0,height:2}, shadowRadius:8,
  },
  devCardTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  devCardName: { fontSize:15, fontWeight:'700', color:C.text },
  devStatus: { flexDirection:'row', alignItems:'center', gap:4 },
  statusDot: { width:8, height:8, borderRadius:4, backgroundColor:C.success },
  statusDotOff: { backgroundColor:C.muted },
  statusDotAlert: { backgroundColor:C.danger },
  statusText: { fontSize:11, color:C.success, fontWeight:'600' },
  statusTextOff: { color:C.muted },
  devCardMeta: { flexDirection:'row', gap:12 },
  devMetaItem: { fontSize:11, color:C.muted },
  devCardActions: { flexDirection:'row', gap:8, marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor:C.border },

  // Buttons
  btn: {
    backgroundColor:C.primary, paddingVertical:10, paddingHorizontal:18,
    borderRadius:8, alignItems:'center', justifyContent:'center',
  },
  btnW: { backgroundColor:C.primary },
  btnS: { backgroundColor:C.muted },
  btnD: { backgroundColor:C.danger },
  btnO: { backgroundColor:C.success },
  btnText: { color:'#FFFFFF', fontSize:13, fontWeight:'600' },
  smBtn: { paddingVertical:6, paddingHorizontal:12, borderRadius:6, alignItems:'center', justifyContent:'center' },
  smBtnT: { fontSize:12, fontWeight:'600', color:'#FFF' },

  // Section Pills
  pills: { flexDirection:'row', paddingHorizontal:16, gap:8, paddingVertical:10, flexWrap:'wrap' },
  pill: { paddingHorizontal:14, paddingVertical:6, borderRadius:16, backgroundColor:C.primaryL, borderWidth:1, borderColor:C.primary },
  pillT: { fontSize:12, fontWeight:'600', color:C.primary },
  pillActive: { backgroundColor:C.primary },
  pillTActive: { color:'#FFF' },
  pillSec: { backgroundColor:C.bg, borderColor:C.border },
  pillSecT: { color:C.muted },

  // Console
  consoleBox: { backgroundColor:C.dark, borderRadius:12, marginHorizontal:16, padding:12, maxHeight:220 },
  consoleLine: { fontSize:11, fontFamily:'monospace', marginBottom:3 },
  consoleTX: { color:C.logTX },
  consoleRX: { color:C.logRX },
  consoleERR: { color:C.logERR },
  consoleINFO: { color:C.logINFO },
  filterRow: { flexDirection:'row', gap:8, paddingHorizontal:16, paddingVertical:8 },

  // KPI Section in Device Detail
  statusRow: { flexDirection:'row', paddingHorizontal:12, paddingVertical:10, gap:8 },
  statusItem: {
    flex:1, backgroundColor:C.primaryL, borderRadius:12,
    padding:12, alignItems:'center', borderWidth:1, borderColor:C.border,
  },
  statusVal: { fontSize:20, fontWeight:'700', color:C.primary },
  statusValOk: { color:C.success },
  statusValErr: { color:C.danger },
  statusLbl: { fontSize:10, color:C.muted, marginTop:3, fontWeight:'500' },

  // Alert Card
  alertCard: {
    backgroundColor:C.card, borderRadius:16, padding:14, marginHorizontal:16, marginVertical:5,
    borderLeftWidth:4, borderWidth:1, borderColor:C.border,
    shadowColor:'#000', shadowOpacity:0.06, shadowOffset:{width:0,height:2}, shadowRadius:8,
  },
  alertCardC: { borderLeftColor:C.danger },
  alertCardW: { borderLeftColor:C.warning },
  alertCardI: { borderLeftColor:C.info },
  alertRow: { flexDirection:'row', alignItems:'flex-start', gap:10 },
  alertIcon: { fontSize:20 },
  alertTitle: { fontSize:14, fontWeight:'700', color:C.text },
  alertMsg: { fontSize:12, color:C.muted, marginTop:3 },
  alertTime: { fontSize:10, color:C.disabled, marginTop:4 },

  // Modal
  modal: { flex:1, justifyContent:'flex-end' },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  modalBox: {
    backgroundColor:C.card, borderTopLeftRadius:24, borderTopRightRadius:24,
    padding:24, paddingBottom:40,
  },
  modalTitle: { fontSize:18, fontWeight:'700', color:C.text, marginBottom:8 },
  modalSub: { fontSize:12, color:C.muted, marginBottom:16 },
  modalInput: {
    backgroundColor:C.bg, borderWidth:1, borderColor:C.border,
    borderRadius:10, paddingHorizontal:14, paddingVertical:12, fontSize:14, color:C.text, marginBottom:12,
  },
  modalCancel: { textAlign:'center', color:C.muted, fontSize:14, marginTop:12, padding:8 },

  // Bottom Nav
  bottomNav: {
    flexDirection:'row', backgroundColor:C.card,
    borderTopWidth:1, borderTopColor:C.border,
    paddingBottom:28, paddingTop:8,
    shadowColor:'#000', shadowOpacity:0.08, shadowOffset:{width:0,height:-2}, shadowRadius:8,
  },
  navItem: { flex:1, alignItems:'center', paddingVertical:4 },
  navIcon: { fontSize:24, marginBottom:2 },
  navLabel: { fontSize:9, color:C.muted, fontWeight:'600' },
  navItemA: { },
  navLabelA: { color:C.primary, fontWeight:'700' },

  // Param Card
  paramCard: {
    backgroundColor:C.card, borderRadius:16, padding:14,
    marginHorizontal:16, marginVertical:5, borderWidth:1, borderColor:C.border,
  },
  paramTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' },
  paramName: { fontSize:14, fontWeight:'600', color:C.text, flex:1 },
  paramCode: { fontSize:10, color:C.muted, marginTop:2 },
  paramVal: { fontSize:13, color:C.success, marginTop:6 },
  paramPending: { color:C.warning },
  paramActions: { flexDirection:'row', gap:6, marginTop:10 },

  // Charts placeholder
  chartCard: {
    backgroundColor:C.card, borderRadius:16, marginHorizontal:16, marginVertical:6,
    padding:16, borderWidth:1, borderColor:C.border,
    shadowColor:'#000', shadowOpacity:0.06, shadowOffset:{width:0,height:2}, shadowRadius:8,
  },
  chartTitle: { fontSize:14, fontWeight:'600', color:C.text, marginBottom:12 },
  chartArea: { height:120, backgroundColor:C.bg, borderRadius:10, justifyContent:'center', alignItems:'center' },
  chartLabel: { fontSize:12, color:C.muted },

  // Tab Filter
  tabFilter: { flexDirection:'row', paddingHorizontal:16, gap:8, paddingVertical:10 },
  tabChip: { paddingHorizontal:14, paddingVertical:6, borderRadius:8, backgroundColor:C.card, borderWidth:1, borderColor:C.border },
  tabChipA: { backgroundColor:C.primary, borderColor:C.primary },
  tabChipT: { fontSize:12, fontWeight:'500', color:C.muted },
  tabChipTA: { color:'#FFF' },

  // Badge
  badge: { paddingHorizontal:8, paddingVertical:2, borderRadius:10, fontSize:10, fontWeight:'700' },
  badgeR: { backgroundColor:C.successL, color:C.success },
  badgeY: { backgroundColor:C.warningL, color:C.warning },
  badgeB: { backgroundColor:C.dangerL, color:C.danger },
});

// ===== Utility =====
const hexToBase64 = (hex: string) => {
  const clean = hex.replace(/\s+/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  return btoa(String.fromCharCode(...bytes));
};
const base64ToHex = (b64: string) => {
  const bytes = atob(b64);
  return Array.from(bytes).map(b => b.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
};
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// ===== MOCK DATA =====
const MOCK_DEVICES = [
  {id:'AA:BB:CC:DD:EE:01',name:'Cloudtek-LW01',rssi:-65,bat:80,online:true,last:'3s'},
  {id:'AA:BB:CC:DD:EE:02',name:'Cloudtek-LW02',rssi:-72,bat:45,online:true,last:'12s'},
  {id:'AA:BB:CC:DD:EE:03',name:'LoRa-GW01',rssi:-58,bat:95,online:true,last:'1m'},
  {id:'AA:BB:CC:DD:EE:04',name:'Cloudtek-LW03',rssi:-88,bat:20,online:false,last:'2h'},
  {id:'AA:BB:CC:DD:EE:05',name:'Cloudtek-LW04',rssi:-95,bat:8,online:false,last:'5h'},
];

// ===== MAIN APP =====
export default function App() {
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
  const [devValues, setDevValues] = useState<Record<number,string>>({});
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [connected, setConnected] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [filterDev, setFilterDev] = useState<'ALL'|'ON'|'OFF'|'ALERT'>('ALL');
  const [timeRange, setTimeRange] = useState<'1h'|'24h'|'7d'>('24h');
  const [gps, setGps] = useState<{lat:number;lng:number}|null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  // Initialize BleManager lazily in useEffect to avoid crash on module load
  const bleManagerRef = useRef<BleManager | null>(null);
  const consoleRef = useRef<FlatList>(null);
  const scanRef = useRef<Set<string>>(new Set());
  const deviceRef = useRef<any>(null);
  const charWriteRef = useRef<any>(null);
  const charNotifyRef = useRef<any>(null);

  // GPS Init
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => { setGps({ lat:pos.coords.latitude, lng:pos.coords.longitude }); setGpsLoading(false); },
      () => { setGpsLoading(false); },
      { enableHighAccuracy: false, timeout: 15000 }
    );
  }, []);

  // Lazy init BleManager (do NOT call new BleManager() at module level!)
  useEffect(() => {
    try {
      bleManagerRef.current = new BleManager();
      console.log('[BLE] Manager initialized');
    } catch (e) {
      console.error('[BLE] Init failed:', e);
    }
    return () => {
      if (bleManagerRef.current) {
        bleManagerRef.current.stopDeviceScan();
      }
    };
  }, []);

  // Load saved data
  useEffect(() => {
    AsyncStorage.getItem(DK).then(d => { if(d) setDevices(JSON.parse(d)); });
    AsyncStorage.getItem(AK).then(a => { if(a) setAlerts(JSON.parse(a)); });
  }, []);

  const addLog = (msg: string, type: 'TX'|'RX'|'ERR'|'INFO' = 'INFO') => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [{ ts, msg, type }, ...prev].slice(0, 200));
  };

  // Filtered logs
  const filteredLogs = logs.filter(l => logFilter === 'ALL' || l.type === logFilter);

  // ===== Scan =====
  const startScan = async () => {
    setScanning(true);
    scanRef.current.clear();
    addLog('BLE 掃描開始...', 'INFO');
    bleManagerRef.current?.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error || !device) return;
      if (scanRef.current.has(device.id)) return;
      scanRef.current.add(device.id);
      const d = { id: device.id, name: device.name || device.id.slice(0,17), rssi: null, online: false, last: 'now', bat: null };
      setDevices(prev => {
        const exists = prev.find(x => x.id === d.id);
        if (!exists) { const n = [...prev, d]; AsyncStorage.setItem(DK, JSON.stringify(n)); return n; }
        return prev;
      });
    });
    setTimeout(() => { bleManagerRef.current?.stopDeviceScan(); setScanning(false); addLog(`掃描完成 (${scanRef.current.size})`, 'INFO'); }, 15000);
  };

  const mockScan = () => {
    setScanning(true);
    addLog('Mock BLE 掃描開始...', 'INFO');
    MOCK_DEVICES.forEach((d, i) => {
      setTimeout(() => {
        setDevices(prev => {
          const exists = prev.find(x => x.id === d.id);
          if (!exists) { const n = [...prev, d]; AsyncStorage.setItem(DK, JSON.stringify(n)); return n; }
          return prev;
        });
        addLog(`Found: ${d.name} RSSI:${d.rssi} dBm`, 'INFO');
        if (i === MOCK_DEVICES.length - 1) {
          setScanning(false);
          addLog(`掃描完成 (${MOCK_DEVICES.length})`, 'INFO');
        }
      }, i * 1000);
    });
  };

  // ===== Connect =====
  const connectDevice = async (device: any) => {
    setSelectedDevice(device);
    setConnected(true);
    setAuthed(true);
    addLog(`連線至 ${device.name}...`, 'INFO');
    setDevValues({
      0x01:'4.2.1', 0x02: device.id.replace(/:/g,''),
      0x03: Math.floor(Math.random()*30+60).toString(),
      0x04: device.name, 0x10:'01', 0x26:'04', 0x27:'01',
      0x31:'03', 0x32:'00', 0x60:'01', 0x80:'4D4F4B4F',
    });
    setTimeout(() => addLog(`密碼驗證成功 ✓`, 'INFO'), 500);
  };

  const disconnectDevice = () => {
    setSelectedDevice(null);
    setConnected(false);
    setAuthed(false);
    setDevValues({});
    setLogs([]);
    addLog('已斷開連線', 'INFO');
  };

  // ===== Params =====
  const readParam = (k: number) => {
    setPending(prev => new Set([...prev, k]));
    addLog(`TX → READ 0x${k.toString(16).toUpperCase().padStart(2,'0')}`, 'TX');
    setTimeout(() => {
      setDevValues(prev => ({...prev, [k]: Math.floor(Math.random()*255).toString(16).toUpperCase().padStart(2,'0')}));
      setPending(prev => { const n = new Set(prev); n.delete(k); return n; });
      addLog(`RX ← 0x${k.toString(16).toUpperCase().padStart(2,'0')} = ??`, 'RX');
    }, 400 + Math.random() * 400);
  };

  const writeParam = (k: number, val: string) => {
    setPending(prev => new Set([...prev, k]));
    addLog(`TX → WRITE 0x${k.toString(16).toUpperCase().padStart(2,'0')} = ${val}`, 'TX');
    setTimeout(() => {
      setDevValues(prev => ({...prev, [k]: val}));
      setPending(prev => { const n = new Set(prev); n.delete(k); return n; });
      addLog(`RX ← ACK 0x${k.toString(16).toUpperCase().padStart(2,'0')}`, 'RX');
    }, 500);
  };

  const execCmd = (k: number) => {
    addLog(`TX → EXEC 0x${k.toString(16).toUpperCase().padStart(2,'0')}`, 'TX');
    setTimeout(() => addLog(`RX ← OK`, 'RX'), 300);
  };

  // ===== Computed =====
  const onlineCount = devices.filter(d => d.online).length;
  const alertCount = alerts.length;
  const filteredDevices = devices.filter(d => {
    if (search && !d.name?.toLowerCase().includes(search.toLowerCase()) && !d.id.includes(search)) return false;
    if (filterDev === 'ON' && !d.online) return false;
    if (filterDev === 'OFF' && d.online) return false;
    if (filterDev === 'ALERT' && (!d.bat || d.bat > 20)) return false;
    return true;
  });

  const filteredAlerts = alerts.filter(a => alertFilter === 'ALL' || a.type === alertFilter);

  // ===== KPI Cards =====
  const KPICard = ({ icon, value, label, trend, color, bg }: any) => (
    <View style={[S.kpiCard, { backgroundColor: bg || C.card }]}>
      <Text style={S.kpiIcon}>{icon}</Text>
      <Text style={[S.kpiVal, color ? {color} : {}]}>{value}</Text>
      <Text style={S.kpiLbl}>{label}</Text>
      {trend && <Text style={S.kpiTrend}>{trend}</Text>}
    </View>
  );

  // ===== StatusDot =====
  const StatusDot = ({ online, size = 8 }: any) => (
    <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: online ? C.success : C.muted, marginRight: 4 }} />
  );

  // ===== TAB: Dashboard =====
  const DashboardTab = () => (
    <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
      {/* KPI Row */}
      <View style={S.kpiRow}>
        <KPICard icon="📡" value={devices.length} label="設備總數" trend={devices.length > 0 ? '+2 新增' : ''} bg={C.primaryL} color={C.primary} />
        <KPICard icon="●" value={onlineCount} label="在線設備" bg={C.successL} color={C.success} />
        <KPICard icon="🔴" value={alertCount} label="活躍告警" bg={alertCount > 0 ? C.dangerL : C.card} color={alertCount > 0 ? C.danger : C.muted} />
        <KPICard icon="📊" value="2.4MB" label="今日用量" />
      </View>

      {/* Chart Placeholder */}
      <Text style={S.sectionTitle}>📈 訊號趨勢</Text>
      <View style={S.chartCard}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:12 }}>
          <Text style={S.chartTitle}>RSSI & Battery</Text>
          <View style={{ flexDirection:'row', gap:8 }}>
            {(['1h','24h','7d'] as const).map(t => (
              <TouchableOpacity key={t} onPress={() => setTimeRange(t)} style={[S.tabChip, timeRange===t && S.tabChipA]}>
                <Text style={[S.tabChipT, timeRange===t && S.tabChipTA]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={S.chartArea}>
          <Text style={S.chartLabel}>📈 折線圖（RSSI / Battery）</Text>
          <Text style={{ fontSize:11, color:C.disabled, marginTop:4 }}>使用 react-native-chart-kit 實作</Text>
        </View>
      </View>

      {/* Device List */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, marginTop:8 }}>
        <Text style={S.sectionTitle}>📋 設備列表</Text>
        <TouchableOpacity onPress={() => setTab('devices')}><Text style={{ fontSize:12, color:C.primary }}>查看全部 →</Text></TouchableOpacity>
      </View>
      {filteredDevices.slice(0, 3).map((d, i) => (
        <TouchableOpacity key={d.id} style={S.devCard} onPress={() => { connectDevice(d); setTab('devices'); }}>
          <View style={S.devCardTop}>
            <View style={{ flex:1 }}>
              <Text style={S.devCardName}>{d.name}</Text>
              <Text style={S.cardId}>{d.id}</Text>
            </View>
            <View style={[S.devStatus]}>
              <View style={[S.statusDot, !d.online && S.statusDotOff, d.bat && d.bat < 20 && S.statusDotAlert]} />
              <Text style={[S.statusText, !d.online && S.statusTextOff]}>{d.online ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <View style={S.devCardMeta}>
            <Text style={S.devMetaItem}>📶 {d.rssi ? `${d.rssi} dBm` : '—'}</Text>
            <Text style={S.devMetaItem}>🔋 {d.bat ? `${d.bat}%` : '—'}</Text>
            <Text style={S.devMetaItem}>⏱ {d.last}</Text>
          </View>
          <View style={S.devCardActions}>
            <TouchableOpacity style={[S.smBtn, S.btnW]} onPress={() => { connectDevice(d); setTab('devices'); }}><Text style={S.smBtnT}>控制面板</Text></TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, S.btnS]} onPress={() => { connectDevice(d); setTab('devices'); }}><Text style={S.smBtnT}>查看軌跡</Text></TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, S.btnS]} onPress={() => { connectDevice(d); setTab('devices'); }}><Text style={S.smBtnT}>歷史數據</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
      {filteredDevices.length === 0 && (
        <View style={{ alignItems:'center', padding:40 }}>
          <Text style={{ fontSize:40, marginBottom:12 }}>📡</Text>
          <Text style={{ fontSize:14, color:C.muted, textAlign:'center' }}>還沒有設備{'\n'}點擊下方掃描按鈕添加</Text>
        </View>
      )}
      <View style={{ height:80 }} />
    </ScrollView>
  );

  // ===== TAB: Devices =====
  const DevicesTab = () => (
    <View style={S.root}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={S.searchBar}>
          <Text style={{ fontSize:16 }}>🔍</Text>
          <TextInput style={S.searchInput} placeholder="搜尋設備..." placeholderTextColor={C.muted} value={search} onChangeText={setSearch} />
          {scanning && <ActivityIndicator size="small" color={C.primary} />}
        </View>

        {/* Filter */}
        <View style={S.pills}>
          {([['ALL','全部'],['ON','在線'],['OFF','離線'],['ALERT','告警']] as const).map(([k,v]) => (
            <TouchableOpacity key={k} style={[S.pill, filterDev===k && S.pillActive, filterDev!==k && S.pillSec]} onPress={() => setFilterDev(k as any)}>
              <Text style={[S.pillT, filterDev===k && S.pillTActive, filterDev!==k && S.pillSecT]}>{v}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[S.pill, S.btnO]} onPress={mockScan} disabled={scanning}>
            <Text style={S.pillTTActive}>{scanning ? '⏳ 掃描中' : '🔍 掃描'}</Text>
          </TouchableOpacity>
        </View>

        {/* Device List */}
        {filteredDevices.map(d => (
          <TouchableOpacity key={d.id} style={S.devCard} onPress={() => connectDevice(d)}>
            <View style={S.devCardTop}>
              <View style={{ flex:1 }}>
                <Text style={S.devCardName}>{d.name}</Text>
                <Text style={S.cardId}>{d.id}</Text>
              </View>
              <View style={S.devStatus}>
                <View style={[S.statusDot, !d.online && S.statusDotOff, d.bat && d.bat < 20 && S.statusDotAlert]} />
                <Text style={[S.statusText, !d.online && S.statusTextOff]}>{d.online ? 'Online' : 'Offline'}</Text>
              </View>
            </View>
            <View style={S.devCardMeta}>
              <Text style={S.devMetaItem}>📶 {d.rssi ? `${d.rssi} dBm` : '—'}</Text>
              <Text style={S.devMetaItem}>🔋 {d.bat ? `${d.bat}%` : '—'}</Text>
              <Text style={S.devMetaItem}>⏱ {d.last}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {filteredDevices.length === 0 && (
          <View style={{ alignItems:'center', padding:60 }}>
            <Text style={{ fontSize:48, marginBottom:16 }}>📡</Text>
            <Text style={{ fontSize:15, color:C.text2, textAlign:'center', fontWeight:'600' }}>未找到設備</Text>
            <Text style={{ fontSize:13, color:C.muted, marginTop:6, textAlign:'center' }}>
              點擊上方「掃描」按鈕{'\n'}開始搜尋 LoRaWAN 設備
            </Text>
          </View>
        )}
        <View style={{ height:80 }} />
      </ScrollView>
    </View>
  );

  // ===== Device Detail (Single Workspace) =====
  const DeviceDetailTab = () => {
    if (!selectedDevice) {
      return (
        <View style={[S.root, { justifyContent:'center', alignItems:'center' }]}>
          <Text style={{ fontSize:48, marginBottom:16 }}>⚙️</Text>
          <Text style={{ fontSize:16, color:C.text2, fontWeight:'600', marginBottom:8 }}>選擇一個設備</Text>
          <Text style={{ fontSize:13, color:C.muted, textAlign:'center' }}>從設備列表選擇設備以開始控制</Text>
          <TouchableOpacity style={[S.btn, { marginTop:24, width:200 }]} onPress={() => setTab('devices')}>
            <Text style={S.btnText}>前往設備列表</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentSection = SECTIONS[section];

    return (
      <View style={S.root}>
        <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={S.header}>
            <View style={S.headerRow}>
              <TouchableOpacity onPress={disconnectDevice}>
                <Text style={{ color:C.primary, fontSize:13, fontWeight:'600' }}>← 返回</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={disconnectDevice}>
                <Text style={{ color:C.danger, fontSize:13, fontWeight:'700' }}>❌ 斷開</Text>
              </TouchableOpacity>
            </View>
            <Text style={S.headerTitle}>{selectedDevice.name}</Text>
            <Text style={S.headerSub2}>{selectedDevice.id}</Text>
          </View>

          {/* Status Row */}
          <View style={S.statusRow}>
            <View style={S.statusItem}>
              <Text style={[S.statusVal, S.statusValOk]}>●</Text>
              <Text style={S.statusLbl}>{connected ? 'Online' : 'Offline'}</Text>
            </View>
            <View style={S.statusItem}>
              <Text style={[S.statusVal, authed ? S.statusValOk : S.statusLbl]}>{authed ? '✓' : '?'}</Text>
              <Text style={S.statusLbl}>{authed ? '已驗證' : '未驗證'}</Text>
            </View>
            <View style={S.statusItem}>
              <Text style={[S.statusVal, devValues[0x03] ? `parseInt(devValues[0x03],16)` > 20 ? S.statusValOk : S.statusValErr : {}]}>
                {devValues[0x03] ? `${parseInt(devValues[0x03], 16)}%` : '—'}
              </Text>
              <Text style={S.statusLbl}>電量</Text>
            </View>
            <View style={S.statusItem}>
              <Text style={S.statusVal}>{pending.size}</Text>
              <Text style={S.statusLbl}>待回應</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ paddingHorizontal:16, flexDirection:'row', gap:8, marginTop:4, marginBottom:8 }}>
            <TouchableOpacity style={[S.smBtn, S.btnW]} onPress={() => CMDS.slice(0,4).forEach(c => readParam(c.k))}>
              <Text style={S.smBtnT}>📥 讀取全部</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, S.btnO]} onPress={() => execCmd(0xF2)}>
              <Text style={S.smBtnT}>💾 保存</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, S.btnS]} onPress={() => execCmd(0xF0)}>
              <Text style={S.smBtnT}>🔄 重啟</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.smBtn, S.btnD]} onPress={() => execCmd(0xF1)}>
              <Text style={S.smBtnT}>⚠ 重置</Text>
            </TouchableOpacity>
          </View>

          {/* Section Pills */}
          <View style={S.pills}>
            {SECTIONS.map((sec, i) => (
              <TouchableOpacity key={sec.title} style={[S.pill, section===i && S.pillActive, section!==i && S.pillSec]} onPress={() => setSection(i)}>
                <Text style={[S.pillT, section===i && S.pillTActive, section!==i && S.pillSecT]}>{sec.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Params */}
          {currentSection.keys.map(k => {
            const cmd = CMDS.find(c => c.k === k);
            if (!cmd) return null;
            const val = devValues[cmd.k];
            const p = pending.has(cmd.k);
            const display = val ? (cmd.o ? cmd.o[parseInt(val, 16)] || val : val) : '—';
            return (
              <View key={cmd.k} style={[S.paramCard, p && { borderLeftWidth:4, borderLeftColor:C.warning }]}>
                <View style={S.paramTop}>
                  <View style={{ flex:1 }}>
                    <Text style={S.paramName}>{cmd.l}</Text>
                    <Text style={S.paramCode}>{cmd.s} · 0x{cmd.k.toString(16).toUpperCase().padStart(2,'0')} · {cmd.d}</Text>
                  </View>
                  <Text style={[S.paramVal, p && S.paramPending]}>{p ? '⏳' : ''}{display}</Text>
                </View>
                <View style={S.paramActions}>
                  {cmd.d !== 'write' && (
                    <TouchableOpacity style={[S.smBtn, S.btnS]} onPress={() => readParam(cmd.k)}>
                      <Text style={S.smBtnT}>📥 讀</Text>
                    </TouchableOpacity>
                  )}
                  {cmd.d !== 'read' && cmd.t !== 'cmd' && (
                    <TouchableOpacity style={[S.smBtn, S.btnW]} onPress={() => { setModalCmd(cmd); setModalVal(val || ''); setShowModal(true); }}>
                      <Text style={S.smBtnT}>✏️ 寫</Text>
                    </TouchableOpacity>
                  )}
                  {cmd.t === 'cmd' && (
                    <TouchableOpacity style={[S.smBtn, S.btnD]} onPress={() => execCmd(cmd.k)}>
                      <Text style={S.smBtnT}>▶ 執行</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {/* Console */}
          <Text style={S.sectionTitle}>💻 Console</Text>
          <View style={S.filterRow}>
            {([['ALL','全部'],['TX','TX'],['RX','RX'],['ERR','ERR']] as const).map(([k,v]) => (
              <TouchableOpacity key={k} style={[S.tabChip, logFilter===k && S.tabChipA]}
                onPress={() => setLogFilter(k as any)}>
                <Text style={[S.tabChipT, logFilter===k && S.tabChipTA]}>{v}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ flex:1 }} />
            <TouchableOpacity onPress={() => setLogs([])}>
              <Text style={{ fontSize:12, color:C.muted }}>🗑 清除</Text>
            </TouchableOpacity>
          </View>
          <View style={S.consoleBox}>
            <FlatList
              ref={consoleRef}
              data={filteredLogs}
              inverted
              keyExtractor={(_, i) => i.toString()}
              onContentSizeChange={() => consoleRef.current?.scrollToOffset({ offset:0, animated:true })}
              renderItem={({ item }) => (
                <Text style={[S.consoleLine, item.type==='TX'&&S.consoleTX, item.type==='RX'&&S.consoleRX, item.type==='ERR'&&S.consoleERR, item.type==='INFO'&&S.consoleINFO]}>
                  [{item.ts}] {item.type==='TX'?'TX→':item.type==='RX'?'←RX':item.type==='ERR'?'❌ ':''}{item.msg}
                </Text>
              )}
              ListEmptyComponent={<Text style={[S.consoleLine, S.consoleINFO]}>— 無日誌 —</Text>}
            />
          </View>
          <View style={{ height:100 }} />
        </ScrollView>
      </View>
    );
  };

  // ===== TAB: Alerts =====
  const AlertsTab = () => (
    <View style={S.root}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        {/* Filter */}
        <View style={S.tabFilter}>
          {([['ALL','全部'],['C','🔴 Critical'],['W','🟡 Warning'],['I','🔵 Info']] as const).map(([k,v]) => (
            <TouchableOpacity key={k} style={[S.tabChip, alertFilter===k && S.tabChipA]} onPress={() => setAlertFilter(k as any)}>
              <Text style={[S.tabChipT, alertFilter===k && S.tabChipTA]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Alerts List */}
        {(filteredAlerts.length > 0 ? filteredAlerts : [
          {id:1,type:'C',icon:'🔴',title:'Cloudtek-LW01 - RSSI Low',msg:'RSSI: -105 dBm',time:'12:01:23'},
          {id:2,type:'W',icon:'🟡',title:'Cloudtek-LW02 - Battery Low',msg:'Battery: 15%',time:'11:45:00'},
          {id:3,type:'I',icon:'🔵',title:'Cloudtek-LW03 - Back Online',msg:'設備已重新上線',time:'10:30:00'},
        ]).map(a => (
          <View key={a.id} style={[S.alertCard, a.type==='C'&&S.alertCardC, a.type==='W'&&S.alertCardW, a.type==='I'&&S.alertCardI]}>
            <View style={S.alertRow}>
              <Text style={S.alertIcon}>{a.icon}</Text>
              <View style={{ flex:1 }}>
                <Text style={S.alertTitle}>{a.title}</Text>
                <Text style={S.alertMsg}>{a.msg}</Text>
                <Text style={S.alertTime}>{a.time}</Text>
              </View>
            </View>
            <View style={{ flexDirection:'row', gap:8, marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor:C.border }}>
              <TouchableOpacity style={[S.smBtn, S.btnW]}><Text style={S.smBtnT}>查看設備</Text></TouchableOpacity>
              <TouchableOpacity style={[S.smBtn, S.btnS]}><Text style={S.smBtnT}>標記已處理</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height:80 }} />
      </ScrollView>
    </View>
  );

  // ===== TAB: Analytics =====
  const AnalyticsTab = () => (
    <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
      {/* Time Range */}
      <View style={S.tabFilter}>
        {([['1h','1 小時'],['24h','24 小時'],['7d','7 天'],['30d','30 天']] as const).map(([k,v]) => (
          <TouchableOpacity key={k} style={[S.tabChip, timeRange===k && S.tabChipA]} onPress={() => setTimeRange(k as any)}>
            <Text style={[S.tabChipT, timeRange===k && S.tabChipTA]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RSSI Chart */}
      <Text style={S.sectionTitle}>📈 RSSI 訊號強度</Text>
      <View style={S.chartCard}>
        <View style={S.chartArea}>
          <Text style={S.chartLabel}>📶 平均 RSSI: -72 dBm</Text>
          <Text style={{ fontSize:11, color:C.disabled, marginTop:4 }}>使用 Recharts 或 react-native-chart-kit</Text>
        </View>
      </View>

      {/* Battery Chart */}
      <Text style={S.sectionTitle}>🔋 電量趨勢</Text>
      <View style={S.chartCard}>
        <View style={S.chartArea}>
          <Text style={S.chartLabel}>⚡ 平均電量: 68%</Text>
          <Text style={{ fontSize:11, color:C.disabled, marginTop:4 }}>過去 {timeRange}</Text>
        </View>
      </View>

      {/* Stats */}
      <Text style={S.sectionTitle}>📊 統計數據</Text>
      <View style={S.kpiRow}>
        <KPICard icon="📶" value="-72" label="平均 RSSI" bg={C.primaryL} color={C.primary} />
        <KPICard icon="📡" value={`${Math.round((onlineCount/Math.max(devices.length,1))*100)}%`} label="設備存活率" bg={C.successL} color={C.success} />
      </View>
      <View style={S.kpiRow}>
        <KPICard icon="⬆️" value="1.2MB" label="上行數據" />
        <KPICard icon="⬇️" value="3.4MB" label="下行數據" />
      </View>

      {/* Device Performance */}
      <Text style={S.sectionTitle}>📋 設備效能</Text>
      {filteredDevices.slice(0, 5).map(d => (
        <View key={d.id} style={S.card}>
          <View style={S.cardRow}>
            <Text style={S.cardName}>{d.name}</Text>
            <Text style={{ fontSize:11, color:C.muted }}>{d.id}</Text>
          </View>
          <View style={{ flexDirection:'row', gap:16, marginTop:8 }}>
            <Text style={S.devMetaItem}>📶 {d.rssi || '—'} dBm</Text>
            <Text style={S.devMetaItem}>🔋 {d.bat || '—'}%</Text>
            <Text style={[S.devMetaItem, d.online ? {color:C.success} : {color:C.muted}]}>{d.online ? '● Online' : '○ Offline'}</Text>
          </View>
        </View>
      ))}
      <View style={{ height:80 }} />
    </ScrollView>
  );

  // ===== Map Tab =====
  const MapTab = () => {
    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${gps?.lat ?? 25.0330},${gps?.lng ?? 121.5654}&zoom=12`;
    return (
      <View style={{ flex: 1 }}>
        {/* Header Info */}
        <View style={{ padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: C.primary }}>🗺️ 設備地圖</Text>
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            📍 {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : '定位中...'} · {filteredDevices.length} 台設備
          </Text>
        </View>
        {/* Google Maps WebView */}
        <View style={{ flex: 1, margin: 8, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' }}>
          <WebView
            source={{ uri: mapUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={{ marginTop: 12, color: C.muted }}>載入地圖中...</Text>
              </View>
            )}
          />
        </View>
        {/* Device List Mini */}
        <View style={{ padding: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', maxHeight: 120 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredDevices.slice(0, 10).map(d => (
              <TouchableOpacity key={d.id} style={{ width: 100, padding: 8, marginHorizontal: 4, backgroundColor: d.online ? '#ecfdf5' : '#fef2f2', borderRadius: 8 }}
                onPress={() => { connectDevice(d); }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: C.text }} numberOfLines={1}>{d.name}</Text>
                <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>📶 {d.rssi || '—'} dBm</Text>
                <Text style={{ fontSize: 10, color: d.online ? C.success : C.danger }}>{d.online ? '● Online' : '○ Offline'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  // ===== Bottom Nav =====
  const NAV_ITEMS = [
    { key: 'dashboard', icon: '🏠', label: '首頁' },
    { key: 'devices', icon: '📱', label: '設備' },
    { key: 'map', icon: '🗺️', label: '地圖' },
    { key: 'alerts', icon: '🔔', label: '告警', badge: alertCount },
    { key: 'analytics', icon: '📊', label: '分析' },
  ] as const;

  const finalNav = NAV_ITEMS;

  // ===== Modal =====
  const ModalContent = () => {
    if (!modalCmd) return null;
    return (
      <View style={S.modalOverlay}>
        <TouchableOpacity style={{ flex:1 }} onPress={() => setShowModal(false)} />
        <View style={S.modalBox}>
          <Text style={S.modalTitle}>✏️ 寫入: {modalCmd.l}</Text>
          <Text style={S.modalSub}>{modalCmd.s} · 0x{modalCmd.k.toString(16).toUpperCase()} · {modalCmd.d}</Text>
          {modalCmd.o ? (
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
              {modalCmd.o.map((opt: string, i: number) => (
                <TouchableOpacity key={i} style={[S.pill, S.pillActive]} onPress={() => { writeParam(modalCmd.k, i.toString(16).toUpperCase().padStart(2,'0')); setShowModal(false); }}>
                  <Text style={[S.pillT, S.pillTActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <>
              <TextInput style={S.modalInput} value={modalVal} onChangeText={setModalVal} placeholder="輸入值 (HEX)" placeholderTextColor={C.muted} autoFocus />
              <TouchableOpacity style={S.btn} onPress={() => { writeParam(modalCmd.k, modalVal); setShowModal(false); }}>
                <Text style={S.btnText}>寫入</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text style={S.modalCancel}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ===== Current Tab View =====
  // NOTE: Call as functions DashboardTab() NOT as components <DashboardTab />
  // Defining components inside App() causes re-mount on every state change
  // which leads to silent failures. Calling as functions avoids this.
  const renderTab = () => {
    // Special: if on devices tab and device is selected, show detail
    if (selectedDevice && (tab === 'devices' || tab === 'dashboard')) {
      return DeviceDetailTab();
    }
    switch (tab) {
      case 'dashboard': return DashboardTab();
      case 'devices': return DevicesTab();
      case 'map': return MapTab();
      case 'alerts': return AlertsTab();
      case 'analytics': return AnalyticsTab();
      default: return DashboardTab();
    }
  };

  return (
    <SafeAreaView style={S.root}>
      {/* Top Header */}
      <View style={S.header}>
        <View style={S.headerRow}>
          <View>
            <Text style={S.headerLogo}>🛰 LoRaTool</Text>
            <Text style={S.headerSub}>v9.0 · Cloudtek LoRaWAN</Text>
          </View>
          <View style={S.headerRight}>
            {gpsLoading ? (
              <Text style={{ fontSize:11, color:C.muted }}>📍 定位中...</Text>
            ) : gps ? (
              <Text style={{ fontSize:10, color:C.success, fontWeight:'600' }}>📍 {gps.lat.toFixed(3)}, {gps.lng.toFixed(3)}</Text>
            ) : (
              <Text style={{ fontSize:11, color:C.danger }}>📍 定位失敗</Text>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      {/* DEBUG: Tab indicator - if this changes, tab switching works */}
      <View style={{ padding: 8, backgroundColor: '#fff3cd', borderBottomWidth: 1, borderBottomColor: '#ffc107', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#856404' }}>
          📍 當前 Tab: {tab}
        </Text>
      </View>
      {renderTab()}

      {/* Bottom Nav */}
      <View style={S.bottomNav}>
        {finalNav.map(item => (
          <TouchableOpacity key={item.key} style={S.navItem} onPress={() => { if(item.key !== 'devices') setSelectedDevice(null); if(item.key === 'map') setTab('map'); else setTab(item.key as any); }}>
            <Text style={S.navIcon}>{item.icon}</Text>
            <Text style={[S.navLabel, tab === item.key && S.navLabelA]}>{item.label}</Text>
            {item.badge && item.badge > 0 && (
              <View style={{ position:'absolute', top:-2, right:'20%', backgroundColor:C.danger, borderRadius:8, paddingHorizontal:4, paddingVertical:1 }}>
                <Text style={{ fontSize:9, color:'#FFF', fontWeight:'700' }}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal */}
      {showModal && <ModalContent />}
    </SafeAreaView>
  );
}
