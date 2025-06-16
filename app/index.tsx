import { addDoc, collection, Timestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, FlatList, Dimensions } from 'react-native';
import { db } from '../firebase.js'; // adjust path if needed
import { PieChart } from 'react-native-chart-kit';

export default function Index() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expenses, setExpenses] = useState([]);

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

useEffect(() => {
  const q = query(collection(db, 'expenses'), orderBy('timestamp', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setExpenses(data);
  });

  return () => unsubscribe();
}, []);

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

const chartData = expenses.reduce((acc, expense) => {
  const found = acc.find(item => item.name === expense.category);
  if (found) {
    found.amount += expense.amount;
  } else {
    acc.push({ name: expense.category, amount: expense.amount, color: getRandomColor(), legendFontColor: '#333', legendFontSize: 14 });
  }
  return acc;
}, []);

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

<Text style={styles.subHeading}>Spending by Category</Text>
<PieChart
  data={chartData}
  width={Dimensions.get('window').width - 40}
  height={220}
  accessor="amount"
  backgroundColor="transparent"
  paddingLeft="15"
  absolute
/>

    <Text style={styles.subHeading}>Saved Expenses</Text>

<FlatList
  data={expenses}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseText}>₹{item.amount} - {item.category}</Text>
      <Text style={styles.expenseSub}>{item.description}</Text>
    </View>
  )}
/>
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
  subHeading: {
  fontSize: 18,
  marginTop: 24,
  marginBottom: 8,
  fontWeight: '600',
},
expenseItem: {
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderColor: '#ddd'
},
expenseText: {
  fontSize: 16,
  fontWeight: 'bold'
},
expenseSub: {
  fontSize: 14,
  color: '#666'
}
});

