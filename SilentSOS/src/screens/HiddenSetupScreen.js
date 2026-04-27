import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import SecureStore from '../storage/SecureStore';
import { fireSystemTest } from '../services/AlertDispatcher';
import { useRouter } from 'expo-router';
import { startListening, stopListening } from '../services/BackgroundService';
import { Audio } from 'expo-av';

export default function HiddenSetupScreen() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');

  const [contacts, setContacts] = useState(['', '', '']);
  const [cancelCode, setCancelCode] = useState('9999');
  const [escalatePolice, setEscalatePolice] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
useEffect(() => {
  loadSettings();

  // 🎤 REQUEST MIC PERMISSION
  (async () => {
    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Microphone permission is required!");
    } else {
      console.log("✅ Microphone permission granted");
    }
  })();

}, []);

  const loadSettings = async () => {
    const data = await SecureStore.getSettings();
    if (data) {
      if (data.contacts) setContacts(data.contacts);
      if (data.cancelCode) setCancelCode(data.cancelCode);
      if (data.escalatePolice) setEscalatePolice(data.escalatePolice);
    }
  };

  const handleSave = async () => {
    const isValid = contacts.every(email =>
      email === "" || /\S+@\S+\.\S+/.test(email)
    );

    if (!isValid) {
      Alert.alert("Invalid Email", "Please enter valid email addresses");
      return;
    }

    await SecureStore.saveSettings({ contacts, cancelCode, escalatePolice });

    Alert.alert('Saved', 'Settings stored.', [
      {
        text: 'OK',
        onPress: () => {
          if (router.canGoBack()) router.back();
          else router.replace("/");
        }
      }
    ]);
  };

  const handleTest = async () => {
    setLoading(true);

    const validEmails = contacts.filter(email =>
      /\S+@\S+\.\S+/.test(email)
    );

    await fireSystemTest(validEmails);

    setTimeout(() => setLoading(false), 5000);
  };

  const handleStartListening = () => {
    startListening();
    setIsListening(true);
    Alert.alert("Started", "Smart Listening Activated 🎧");
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
    Alert.alert("Stopped", "Smart Listening Disabled ❌");
  };

  // 🔐 PIN SCREEN
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Enter PIN</Text>
        <TextInput
          style={styles.inputAuth}
          secureTextEntry
          keyboardType="numeric"
          onChangeText={setPin}
          value={pin}
        />
        <Button
          title="Login"
          onPress={() => {
            if (pin === '1234') setIsAuthenticated(true);
            else Alert.alert("Wrong PIN ❌");
          }}
        />
      </View>
    );
  }

  // 🔥 MAIN SCREEN
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Config</Text>

      {contacts.map((email, index) => (
        <View key={index}>
          <Text>Trusted Email {index + 1}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(v) => {
              const updated = [...contacts];
              updated[index] = v;
              setContacts(updated);
            }}
            placeholder="example@gmail.com"
            keyboardType="email-address"
          />
        </View>
      ))}

      <Text>Cancel Code</Text>
      <TextInput
        style={styles.input}
        value={cancelCode}
        onChangeText={setCancelCode}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <Text>Escalate to Police</Text>
        <Switch value={escalatePolice} onValueChange={setEscalatePolice} />
      </View>

      <View style={styles.btnSpacing}>
        <Button title="Save Settings" onPress={handleSave} color="#4CAF50" />
      </View>

      <View style={styles.btnSpacing}>
        <Button
          title={loading ? "Sending..." : "Test Dummy Alert"}
          disabled={loading}
          onPress={handleTest}
          color="#F44336"
        />
      </View>

      {/* 🔥 SMART LISTENING */}
      <View style={styles.btnSpacing}>
        <Button
          title="Start Smart Listening 🎧"
          onPress={handleStartListening}
          color="#2196F3"
        />
      </View>

      <View style={styles.btnSpacing}>
        <Button
          title="Stop Listening ❌"
          onPress={handleStopListening}
          color="#9E9E9E"
        />
      </View>

      {isListening && (
        <Text style={{ color: 'green', marginTop: 10 }}>
          🎧 Listening Active...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  inputAuth: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    width: 200,
    textAlign: 'center',
    borderRadius: 5,
    borderWidth: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15
  },
  btnSpacing: {
    marginBottom: 15
  }
});