import React, { useState } from 'react';
import { Keyboard, SafeAreaView, Image, Text, View, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import InputIcon from '../../components/auth/InputIcon';
import FirebaseApp from '../../helpers/FirebaseApp';
import { FontAwesome } from '@expo/vector-icons'
import { signInWithEmailAndPassword  } from 'firebase/auth';
import { ROLES, COLLECTIONS, icons } from '../../constants';

const Login = () => {

    const router = useRouter();

    // Set Firebase App Instance
    const FBApp = new FirebaseApp();

    // Set Variables
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Email Validator
    const email_check = (email) => {

        // Email Validator Regex
        const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        // Check if email
        if (email_regex.test(email)) {
            return true;
        }

        return false;
    }

    // Get User
    const get_user = async (filter) => {

        // Signed in 
        var userdata = await FBApp.db.get(COLLECTIONS.user, filter);

        // There is user
        if (userdata) {
            return userdata;
        }
        
        // Empty password
        setPassword('');

        // Show notif
        ToastAndroid.showWithGravity('Invalid login attempt', ToastAndroid.LONG, ToastAndroid.TOP);
        
        return false;
    }

    // Set Functions
    const handleLoginPress = async () => {

        // Dismiss keyboard
        Keyboard.dismiss();

        // Is email
        const is_email = email_check(username);

        // User
        let user = {};

        // Check if email is used
        if (is_email) {
            user.email = username;
        }
        else {
            user = await get_user({
                column: 'username',
                comparison: '==',
                value: username
            });

            // Don't continue if not found
            if (!user) {
                return false;
            }
        }

        // Sign In
        signInWithEmailAndPassword(FBApp.auth(), user.email, password).then(async (userCredential) => {
            
            // Get user if email
            if (is_email) {
                user = await get_user({
                    column: 'userId',
                    comparison: '==',
                    value: userCredential.user.uid
                });
            }

            // Set Session for User
            FBApp.session.set('user', JSON.stringify(user));
            
            // Show notif
            ToastAndroid.showWithGravity('Welcome back, ' + [user.firstName, user.lastName].join(' '), ToastAndroid.LONG, ToastAndroid.TOP);

            // Based Dashboard
            switch (user.role) {
                case ROLES.customer: router.replace('/dashboard/Dashboard'); break;
                case ROLES.staff: router.replace('/dashboard/StaffDashboard'); break;
            }
        })
        .catch((error) => {

            // Empty password
            setPassword('');

            // Show notif
            ToastAndroid.showWithGravity(error.message, ToastAndroid.LONG, ToastAndroid.TOP);
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require('../../assets/images/logos/normal.png')} style={styles.logoImage} />
                <Text style={styles.logoText}>WasteNot</Text>
            </View>
            <View style={styles.formContainer}>
                <Text style={styles.heading}>LOGIN</Text>
                <InputIcon
                    icon={'user-circle-o'}
                    placeholder={'Username'}
                    value={username}
                    setValue={setUsername}
                    isSlimIcon={false}
                    inputStyle={styles.input}
                    placeholderTextColor="#C5BD62"
                />
                <InputIcon
                    icon={'lock'}
                    placeholder={'Password'}
                    value={password}
                    setValue={setPassword}
                    isSecure={true}
                    inputStyle={styles.input}
                    placeholderTextColor="#C5BD62"
                />
                <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </View>
            <View style={styles.foot}>
                <Text style={styles.signUpText}>
                    Don't have any account yet?{' '}
                    <Text style={styles.signUpLink} onPress={() => router.replace('/auth/Register')}>
                        Sign Up
                    </Text>
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        flexDirection: 'column', // Changed to column for vertical alignment
        alignItems: 'center',
        marginBottom: 20,
    },
    logoImage: {
        height: 100,
        width: 100,
        marginRight: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#18C573',
    },
    formContainer: {
        backgroundColor: '#18C573',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
      },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#18C573',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        color: '#333',
    },
    loginButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    loginButtonText: {
        color: '#3DCA64',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    forgotPasswordText: {
        color: '#FFFFFF',
        marginTop: 10,
        textDecorationLine: 'underline',
    },
    signUpText: {
        color: '#333',
        marginTop: 20,
    },
    signUpLink: {
        color: '#18C573',
        textDecorationLine: 'underline',
    },
    foot: {
        marginBottom: 70,
    },
});
export default Login;