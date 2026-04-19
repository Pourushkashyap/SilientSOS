import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import BackgroundServiceManager from '../services/BackgroundService';
import { checkSequence } from '../utils/SecretCode';

export default function CalculatorScreen({ navigation }) {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState(null);
  const [firstValue, setFirstValue] = useState('');
  const [keyBuffer, setKeyBuffer] = useState('');

  useEffect(() => {
    BackgroundServiceManager.start();
  }, []);

  const handleInput = (num, type) => {
    // Secret code check
    let newBuffer = keyBuffer + num;
    if (newBuffer.length > 10) newBuffer = newBuffer.slice(newBuffer.length - 10);
    setKeyBuffer(newBuffer);

    const { isSetupCode } = checkSequence(num, newBuffer);
    if (isSetupCode) {
      setKeyBuffer('');
      setDisplayValue('0');
      navigation.navigate('Setup');
      return;
    }

    if (type === 'number') {
      setDisplayValue((prev) => (prev === '0' ? num : prev + num));
    } else if (type === 'operator') {
      setFirstValue(displayValue);
      setOperator(num);
      setDisplayValue('0');
    } else if (type === 'clear') {
      setDisplayValue('0');
      setFirstValue('');
      setOperator(null);
      setKeyBuffer('');
    } else if (type === 'equal') {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const a = parseFloat(firstValue);
    const b = parseFloat(displayValue);
    let res = 0;
    if (operator === '+') res = a + b;
    else if (operator === '-') res = a - b;
    else if (operator === 'X') res = a * b;
    else if (operator === '/') res = a / b;
    
    setDisplayValue(res.toString());
    setOperator(null);
    setFirstValue('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{displayValue}</Text>
      </View>
      <View style={styles.row}>
        <CalcButton label="C" type="clear" onPress={handleInput} color="#a5a5a5" textColor="#000" />
        <CalcButton label="+/-" type="operator" onPress={handleInput} color="#a5a5a5" textColor="#000" />
        <CalcButton label="%" type="operator" onPress={handleInput} color="#a5a5a5" textColor="#000" />
        <CalcButton label="/" type="operator" onPress={handleInput} color="#ff9f0a" />
      </View>
      <View style={styles.row}>
        <CalcButton label="7" type="number" onPress={handleInput} />
        <CalcButton label="8" type="number" onPress={handleInput} />
        <CalcButton label="9" type="number" onPress={handleInput} />
        <CalcButton label="X" type="operator" onPress={handleInput} color="#ff9f0a" />
      </View>
      <View style={styles.row}>
        <CalcButton label="4" type="number" onPress={handleInput} />
        <CalcButton label="5" type="number" onPress={handleInput} />
        <CalcButton label="6" type="number" onPress={handleInput} />
        <CalcButton label="-" type="operator" onPress={handleInput} color="#ff9f0a" />
      </View>
      <View style={styles.row}>
        <CalcButton label="1" type="number" onPress={handleInput} />
        <CalcButton label="2" type="number" onPress={handleInput} />
        <CalcButton label="3" type="number" onPress={handleInput} />
        <CalcButton label="+" type="operator" onPress={handleInput} color="#ff9f0a" />
      </View>
      <View style={styles.row}>
        <CalcButton label="0" type="number" onPress={handleInput} double />
        <CalcButton label="." type="number" onPress={handleInput} />
        <CalcButton label="=" type="equal" onPress={handleInput} color="#ff9f0a" />
      </View>
    </SafeAreaView>
  );
}

const CalcButton = ({ label, onPress, type, color = '#333333', textColor = '#fff', double }) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color, flex: double ? 2.15 : 1 }]}
    onPress={() => onPress(label, type)}
  >
    <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  displayContainer: {
    padding: 20,
    alignItems: 'flex-end',
  },
  displayText: {
    color: '#fff',
    fontSize: 80,
    fontWeight: '300',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '400',
  },
});
