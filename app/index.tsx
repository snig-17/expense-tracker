import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../firebase.js'; // adjust path if needed

export default function Index() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

const handleSave = async () => {
  if (!amount || !category) {
    Alert.alert('Missing Info', 'Please fill in amount and category.');
    return;
  }

  Alert.alert('Saved!', `₹${amount} - ${category}\n${description}`);
  setAmount('');
  setCategory('');
  setDescription('');
  
  await addDoc(collection(db, 'expenses'), {
  amount: parseFloat(amount),
  category,
  description,
  timestamp: Timestamp.now()
});
};
  return (
    <View style={styles.container}>
    <Text style={styles.heading}>Smart Expense Tracker</Text>

    <TextInput
      style={styles.input}
      placeholder="Amount (₹)"
      keyboardType="numeric"
      value={amount}
      onChangeText={setAmount}
    />

    <TextInput
      style={styles.input}
      placeholder="Category (e.g. Food)"
      value={category}
      onChangeText={setCategory}
    />

    <TextInput
      style={styles.input}
      placeholder="Description (optional)"
      value={description}
      onChangeText={setDescription}
    />

    <Button title="Save Expense" onPress={handleSave} />
  </View>
  );
}
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});

