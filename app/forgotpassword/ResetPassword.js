import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
//import Navigation from '../../components/common/navigation/Navigation';

const ResetPassword = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/wastenoticon.png')} style={styles.logo} />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Reset Password</Text>
        </View>
        <View style={styles.inputContainer}>
          <Image source={require('../../assets/lock.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
          />
        </View>
        <View style={styles.inputContainer}>
          <Image source={require('../../assets/lock.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buttonCancel} onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.buttonTextCancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center', // Center the logo horizontally
    marginBottom: 75, // Add some spacing below the logo
  },
  logo: {
    width: 150, // Adjust the width as needed
    height: 150, // Adjust the height as needed
    resizeMode: 'contain', // Maintain aspect ratio while resizing
  },
  formContainer: {
    backgroundColor: '#6AD975',
    padding: 20,
    marginBottom: 80,
    borderRadius: 10,
    width: '90%', // Adjust the width as needed
  },
  headingContainer: {
    marginBottom: 10,
  },
  heading: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', // Align text to the left
  },
  subheading: {
    color: '#FFF',
    textAlign: 'left', // Align text to the left
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Align items vertically
    backgroundColor: '#FFF',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    width: 20, // Set the width of the icon
    height: 20, // Set the height of the icon
    marginRight: 10, // Add spacing between icon and text input
  },
  input: {
    height: 40,
    flex: 1, // Allow the TextInput to take up remaining space
    color: '#666', // Change the input text color
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    marginTop: 32.5,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    borderColor: '#389F4F',
    borderWidth: 1,
  },
  buttonText: {
    color: '#6AD975',
    fontWeight: 'bold',
    fontSize: 19,
    textAlign: 'center', // Align button text to the center
  },
  buttonCancel: {
    marginTop:10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    borderColor: '#ED5E5E',
    borderWidth: 1,
  },
  buttonTextCancel: {
    color: '#ED5E5E',
    fontWeight: 'bold',
    fontSize: 19,
    textAlign: 'center', // Align button text to the center
  }
});


export default ResetPassword;