import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ToastAndroid } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import FirebaseApp from '../../helpers/FirebaseApp';

const ForgotPassword = () => {

  // Firebase App
  const FBApp = new FirebaseApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const handleResetPasswordPress = () => {
    
      // Send attempt
      sendPasswordResetEmail(FBApp.auth(), email).then(() => {
          
          // Show notif
          ToastAndroid.showWithGravity('Reset password link sent. Please check your email.', ToastAndroid.LONG, ToastAndroid.TOP);

          // Back to login
          router.replace('/auth/Login');
      }).catch(({ message }) => ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.TOP));
  }

  return (
      <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/wastenotshadow.png')} style={styles.logo} />
          </View>
          <View style={styles.formContainer}>
              <View style={styles.headingContainer}>
                  <Text style={styles.heading}>Hey, Staff!</Text>
              </View>
              <Text style={styles.subheading}>Enter your Email and click the button to reset your password.</Text>
              <View style={styles.inputContainer}>
                  <Image source={require('../../assets/emailicon.png')} style={styles.inputIcon} />
                  <TextInput
                      style={styles.input}
                      placeholder="Enter Email"
                      placeholderTextColor="#666"
                      onChangeText={ (text) => setEmail(text) }
                      value={ email }
                  />
              </View>
              <TouchableOpacity style={styles.button} onPress={ handleResetPasswordPress }>
                  <Text style={styles.buttonText}>Reset Password</Text>
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
    textAlign: 'left', // Align text to the left
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
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#6AD975',
    fontWeight: 'bold',
    fontSize: 19,
    textAlign: 'center', // Align button text to the center
  },
});

export default ForgotPassword;