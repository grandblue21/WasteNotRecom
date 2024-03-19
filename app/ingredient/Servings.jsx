import React, { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const Servings = () => {
  const [inputValue, setInputValue] = useState('');

  const handleButtonPress = (value) => {
    if (value === 'C') {
      // Clear button
      setInputValue('');
    } else {
      setInputValue((prevValue) => prevValue + value.toString());
    }
  };

  const handleConfirmPress = () => {
    // Add logic for handling the Confirm button press
    console.log('Confirm button pressed with input:', inputValue);
  };

  const renderCalculatorButtons = () => {
    const rows = [];
    const buttonValues = [
      [7, 8, 9],
      [4, 5, 6],
      [1, 2, 3],
      [0, 'C'],
    ];

    for (let i = 0; i < buttonValues.length; i++) {
      const buttons = buttonValues[i].map((value) => (
        <TouchableOpacity
          key={value}
          style={
            value === 'C'
              ? { ...styles.clearButton, backgroundColor: '#e74c3c' }
              : styles.calculatorButton
          }
          onPress={() => handleButtonPress(value)}
        >
          <Text style={styles.buttonText}>{value}</Text>
        </TouchableOpacity>
      ));

      rows.push(
        <View key={i} style={styles.buttonRow}>
          {buttons}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.roundImage}
        />
      </View>
      <Text style={styles.sampleText}>Sample Text</Text>
      <Text style={styles.howManyText}>How many servings?</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.roundedInput}
          placeholder="Enter servings"
          keyboardType="numeric"
          value={inputValue}
          onChangeText={(text) => setInputValue(text)}
        />
      </View>
      <View style={styles.buttonContainer}>{renderCalculatorButtons()}</View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPress}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sampleText: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: 'bold',
  },
  howManyText: {
    marginTop: 10,
    fontSize: 20,
    color: '#555',
  },
  inputContainer: {
    width: '80%',
    marginTop: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  roundedInput: {
    width: '100%',
    padding: 10,
    fontSize: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calculatorButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: '#389F4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  confirmButton: {
    marginTop: 5,
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Servings;