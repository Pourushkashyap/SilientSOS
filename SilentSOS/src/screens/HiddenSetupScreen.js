import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button,
  StyleSheet, Switch, Alert, ActivityIndicator
} from 'react-native';
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

  // FIX Bug 6: load saved PIN from SecureStore
  const [savedPin, setSavedPin] = useState(null);
  const [pinLoading, setPinLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    requestMicPermission();
  }, []);

  const requestMicPermission = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Microphone permission is required!");
    } else {
      console.log("✅ Microphone permission granted");
    }
  };

  const loadSettings = async () => {
    try {
      const data = await SecureStore.getSettings();
      if (data) {
        if (data.contacts) setContacts(data.contacts);
        if (data.cancelCode) setCancelCode(data.cancelCode);
        if (data.escalatePolice) setEscalatePolice(data.escalatePolice);

        // FIX Bug 6: load the saved PIN — fallback to '1234' only if never set before
        setSavedPin(data.pin || '1234');
      } else {
        setSavedPin('1234'); // first ever launch default
      }
    } catch (e) {
      console.log("Load settings error:", e);
      setSavedPin('1234');
    } finally {
      setPinLoading(false);
    }
  };

  // FIX Bug 6: PIN checked against SecureStore value, not hardcoded string
  const handleLogin = () => {
    if (pinLoading) return; // wait for settings to load first

    if (pin === savedPin) {
      setIsAuthenticated(true);
      setPin('');
    } else {
      Alert.alert("Wrong PIN ❌", "Please try again.");
      setPin('');
    }
  };

  const handleSave = async () => {
    const isValid = contacts.every(email =>
      email === "" || /\S+@\S+\.\S+/.test(email)
    );

    if (!isValid) {
      Alert.alert("Invalid Email", "Please enter valid email addresses.");
      return;
    }

    // FIX Bug 6: save the current PIN along with all other settings
    await SecureStore.saveSettings({
      contacts,
      cancelCode,
      escalatePolice,
      pin: savedPin  // keep existing PIN on save (changed via Change PIN flow)
    });

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

  const handleChangePin = () => {
    Alert.prompt(
      "Change PIN",
      "Enter your new PIN (numbers only):",
      async (newPin) => {
        if (!newPin || newPin.length < 4) {
          Alert.alert("Invalid PIN", "PIN must be at least 4 digits.");
          return;
        }
        if (!/^\d+$/.test(newPin)) {
          Alert.alert("Invalid PIN", "PIN must contain numbers only.");
          return;
        }

        const data = await SecureStore.getSettings() || {};
        await SecureStore.saveSettings({ ...data, pin: newPin });
        setSavedPin(newPin);
        Alert.alert("PIN Updated", "Your new PIN has been saved.");
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleTest = async () => {
    setLoading(true);
    const validEmails = contacts.filter(email => /\S+@\S+\.\S+/.test(email));

    if (validEmails.length === 0) {
      Alert.alert("No Emails", "Please add at least one valid email first.");
      setLoading(false);
      return;
    }

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

  // PIN screen — show spinner while loading saved PIN from SecureStore
  if (!isAuthenticated) {
    if (pinLoading) {
      return (
        <View style={styles.authContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, color: '#666' }}>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Enter PIN</Text>
        <TextInput
          style={styles.inputAuth}
          secureTextEntry
          keyboardType="numeric"
          onChangeText={setPin}
          value={pin}
          maxLength={8}
          placeholder="····"
          placeholderTextColor="#aaa"
        />
        <Button
          title="Login"
          onPress={handleLogin}
          color="#4CAF50"
        />
      </View>
    );
  }

  // Main settings screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Config</Text>

      {contacts.map((email, index) => (
        <View key={index}>
          <Text style={styles.label}>Trusted Email {index + 1}</Text>
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
            autoCapitalize="none"
          />
        </View>
      ))}

      <Text style={styles.label}>Cancel Code</Text>
      <TextInput
        style={styles.input}
        value={cancelCode}
        onChangeText={setCancelCode}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <Text style={styles.label}>Escalate to Police</Text>
        <Switch value={escalatePolice} onValueChange={setEscalatePolice} />
      </View>

      <View style={styles.btnSpacing}>
        <Button title="Save Settings" onPress={handleSave} color="#4CAF50" />
      </View>

      {/* FIX Bug 6: button to change PIN securely */}
      <View style={styles.btnSpacing}>
        <Button title="Change PIN" onPress={handleChangePin} color="#607D8B" />
      </View>

      <View style={styles.btnSpacing}>
        <Button
          title={loading ? "Sending..." : "Test Dummy Alert"}
          disabled={loading}
          onPress={handleTest}
          color="#F44336"
        />
      </View>

      <View style={styles.btnSpacing}>
        <Button
          title="Start Smart Listening 🎧"
          onPress={handleStartListening}
          color="#2196F3"
          disabled={isListening}
        />
      </View>

      <View style={styles.btnSpacing}>
        <Button
          title="Stop Listening ❌"
          onPress={handleStopListening}
          color="#9E9E9E"
          disabled={!isListening}
        />
      </View>

      {isListening && (
        <Text style={styles.listeningText}>🎧 Listening Active...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 4
  },
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
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 20,
    letterSpacing: 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15
  },
  btnSpacing: {
    marginBottom: 15
  },
  listeningText: {
    color: 'green',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500'
  }
});