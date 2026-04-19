import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import SecureStore from '../storage/SecureStore';
import { fireSystemTest } from '../services/AlertDispatcher';

export default function HiddenSetupScreen({ navigation }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  
  const [contacts, setContacts] = useState(['', '', '']);
  const [cancelCode, setCancelCode] = useState('9999');
  const [escalatePolice, setEscalatePolice] = useState(false);

  useEffect(() => {
    loadSettings();
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
    await SecureStore.saveSettings({ contacts, cancelCode, escalatePolice });
    Alert.alert('Saved', 'Secured settings stored locally.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

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
        <Button title="Login" onPress={() => {
          if(pin === '1234') setIsAuthenticated(true);
        }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Config</Text>
      
      <Text>Trusted Contact 1</Text>
      <TextInput style={styles.input} value={contacts[0]} onChangeText={(v) => setContacts([v, contacts[1], contacts[2]])} placeholder="+1234567890" keyboardType="phone-pad" />
      
      <Text>Trusted Contact 2</Text>
      <TextInput style={styles.input} value={contacts[1]} onChangeText={(v) => setContacts([contacts[0], v, contacts[2]])} placeholder="+1234567890" keyboardType="phone-pad" />

      <Text>Trusted Contact 3</Text>
      <TextInput style={styles.input} value={contacts[2]} onChangeText={(v) => setContacts([contacts[0], contacts[1], v])} placeholder="+1234567890" keyboardType="phone-pad" />

      <Text>Cancel Code</Text>
      <TextInput style={styles.input} value={cancelCode} onChangeText={setCancelCode} keyboardType="numeric" />

      <View style={styles.row}>
        <Text>Escalate to Police</Text>
        <Switch value={escalatePolice} onValueChange={setEscalatePolice} />
      </View>

      <View style={styles.btnSpacing}>
        <Button title="Save Settings" onPress={handleSave} color="#4CAF50" />
      </View>
      
      <View style={styles.btnSpacing}>
        <Button title="Test Dummy Alert" onPress={() => fireSystemTest(contacts)} color="#F44336" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 10, marginVertical: 5, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' },
  inputAuth: { backgroundColor: '#fff', padding: 10, marginVertical: 10, width: 200, textAlign: 'center', borderRadius: 5, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  btnSpacing: { marginBottom: 15 }
});
