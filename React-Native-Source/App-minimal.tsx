/**
 * LoRaTool v9.12 - MINIMAL TEST VERSION
 * Just tests if basic state and rendering work
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const App = () => {
  const [tab, setTab] = useState('home');
  const [counter, setCounter] = useState(0);

  console.log('[RENDER] tab =', tab, 'counter =', counter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛰 LoRaTool v9.12 MINIMAL</Text>
        <Text style={styles.counter}>Counter: {counter}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.currentTab}>📍 當前頁面: {tab}</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.log('[BUTTON] Pressed, setting tab to home');
            setTab('home');
            setCounter(c => c + 1);
          }}
        >
          <Text style={styles.buttonText}>🏠 Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.log('[BUTTON] Pressed, setting tab to settings');
            setTab('settings');
            setCounter(c => c + 1);
          }}
        >
          <Text style={styles.buttonText}>⚙️ Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.log('[BUTTON] Pressed, incrementing counter');
            setCounter(c => c + 1);
          }}
        >
          <Text style={styles.buttonText}>➕ Increment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debug}>
        <Text>State: tab={tab}, counter={counter}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#2563EB', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  counter: { fontSize: 16, color: '#fff', marginTop: 5 },
  content: { flex: 1, padding: 20 },
  currentTab: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  button: { backgroundColor: '#16A34A', padding: 20, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  debug: { padding: 10, backgroundColor: '#333', margin: 10, borderRadius: 5 },
});

export default App;
