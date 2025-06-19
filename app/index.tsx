import { addDoc, collection, Timestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, FlatList, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase.js'; // adjust path if needed
import { PieChart, LineChart } from 'react-native-chart-kit';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Index() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState('');
  const [currentBudget, setCurrentBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const fakeExpenses = [
  { amount: 200, category: 'Food', timestamp: { seconds: 1718580000 } }, // June 17
  { amount: 300, category: 'Travel', timestamp: { seconds: 1718493600 } }, // June 16
  { amount: 400, category: 'Bills', timestamp: { seconds: 1718407200 } }, // June 15
];

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

const saveBudget = async () => {
  const docRef = doc(db, 'settings', 'monthlyBudget');
  await setDoc(docRef, { amount: parseFloat(budget) });
  setCurrentBudget(parseFloat(budget));
  setBudget('');
  Alert.alert('Budget Saved', `New monthly budget set to ₹${budget}`);
};

useEffect(() => {
  const q = query(collection(db, 'expenses'), orderBy('timestamp', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const expensesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setExpenses(expensesData);
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  setTotalSpent(total);
}, [expenses]);

useEffect(() => {
  const fetchBudget = async () => {
    const docRef = doc(db, 'settings', 'monthlyBudget');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setCurrentBudget(snap.data().amount);
    }
  };
  fetchBudget();
}, []);

const categoryColors: { [key: string]: string } = {
  Food: '#FFB3BA',       // pastel pink
  Travel: '#BAE1FF',     // pastel blue
  Bills: '#FFFFBA',      // pastel yellow
  Shopping: '#BFFCC6',   // pastel green
  Other: '#D5BAFF',      // pastel purple
};

const chartData = expenses.reduce((acc, expense) => {
  const found = acc.find(item => item.name === expense.category);
  if (found) {
    found.amount += expense.amount;
  } else {
    acc.push({ name: expense.category, amount: expense.amount, color: categoryColors[expense.category] || '#888', legendFontColor: '#333', legendFontSize: 14 });
  }
  return acc;
}, []);

const lineChartData = {
  labels: [],
  datasets: [{ data: [] }]
};

const dailyTotals: { [key: string]: number } = {};

expenses.forEach(expense => {
  const date = new Date(expense.timestamp.seconds * 1000).toLocaleDateString();
  dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
});

lineChartData.labels = Object.keys(dailyTotals);
lineChartData.datasets[0].data = Object.values(dailyTotals);


  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
    <Text style={styles.heading}>Smart Expense Tracker</Text>

    <TextInput
      style={styles.input}
      placeholder="Amount (₹)"
      keyboardType="numeric"
      value={amount}
      onChangeText={setAmount}
      placeholderTextColor="#BFA6FF"
    />

    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
        dropdownIconColor="#8D9BFF"
      >
        <Picker.Item label="Select Category" value="" color="#BFA6FF" />
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Travel" value="Travel" />
        <Picker.Item label="Bills" value="Bills" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
    </View>

    <TextInput
      style={styles.input}
      placeholder="Description (optional)"
      value={description}
      onChangeText={setDescription}
      placeholderTextColor="#BFA6FF"
    />

    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
      <Text style={styles.saveButtonText}>Save Expense</Text>
    </TouchableOpacity>

    <Text style={styles.subHeading}>Monthly Budget</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Monthly Budget (₹)"
      keyboardType="numeric"
      value={budget}
      onChangeText={setBudget}
      placeholderTextColor="#BFA6FF"
    />
    <TouchableOpacity onPress={saveBudget} style={styles.saveButton}>
      <Text style={styles.saveButtonText}>Save Budget</Text>
    </TouchableOpacity>
    <Text style={styles.expenseSub}>Current Budget: ₹{currentBudget}</Text>
    <Text style={styles.expenseSub}>Remaining: ₹{currentBudget - totalSpent}</Text>

<View style={styles.chartRow}>
  <View style={{ alignItems: 'center' }}>
    <Text style={styles.subHeading}>Spending by Category</Text>
    <PieChart
      data={chartData}
      width={(Dimensions.get('window').width - 60) / 2}
      height={220}
      accessor="amount"
      backgroundColor="transparent"
      paddingLeft="10"
      absolute
      chartConfig={{
        color: (opacity = 1) => `rgba(141, 155, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(101, 90, 141, ${opacity})`,
      }}
    />
  </View>

  <View style={{ alignItems: 'center' }}>
    <Text style={styles.subHeading}>Daily Spending</Text>
    <View style={{ backgroundColor: '#FFF5FB', borderRadius: 8 }}>
      <LineChart
        data={lineChartData}
        width={(Dimensions.get('window').width - 60) / 2}
        height={220}
        yAxisLabel="₹"
        formatXLabel={(label) => label.slice(0, 5)}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
          propsForBackgroundLines: {
            stroke: '#e3e3e3',
          },
        }}
        withDots
        withShadow
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLabels
        withHorizontalLabels
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 8,
        }}
      />
    </View>
  </View>
</View>


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
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFF5FB', // pastel background
  },
  container: {
    padding: 24,
    backgroundColor: '#FFF5FB',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8D9BFF', // soft violet
  },
  input: {
    height: 48,
    borderColor: '#D5BAFF',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    color: '#655A8D',
  },
  pickerWrapper: {
    borderColor: '#D5BAFF',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    height: 48,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    width: '100%',
    color: '#655A8D',
  },
  subHeading: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 8,
    fontWeight: '600',
    color: '#8D9BFF',
  },
  expenseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#E8D4FA',
  },
  expenseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#655A8D',
  },
  expenseSub: {
    fontSize: 14,
    color: '#9991B3',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#8D9BFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
