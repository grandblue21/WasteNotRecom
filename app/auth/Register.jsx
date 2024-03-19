import React, { useState } from 'react';
import { Keyboard, SafeAreaView, Text, View, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import InputIcon from '../../components/auth/InputIcon';
import FirebaseApp from '../../helpers/FirebaseApp';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Checkbox from 'expo-checkbox';
import { FontAwesome } from '@expo/vector-icons';
import { ROLES, COLLECTIONS } from '../../constants';

const Register = () => {

    const router = useRouter();

    // Set Variables
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [isChecked, setChecked] = useState(false);
    const handleRegisterPress = () => {

        // Dismiss keyboard
        Keyboard.dismiss();

        // Checks if terms and conditions is checked
        if (!isChecked) {

            // Show notif
            ToastAndroid.showWithGravity('Agree on terms and conditions to sign up', ToastAndroid.LONG, ToastAndroid.TOP);

            return false;
        }

        // Set Firebase App Instance
        const FBApp = new FirebaseApp();

        // Register User
        createUserWithEmailAndPassword(FBApp.auth(), email, password).then(async (userCredential) => {

            // Signed up 
            const user = userCredential.user;

            // Set firestore instance
            FBApp.db.insert(COLLECTIONS.user, {
                role: ROLES.customer,
                userId: userCredential.user.uid,
                username: username,
                firstName: firstName,
                lastName: lastName,
                address: address,
                email: email
            });
            
            // Show notif
            ToastAndroid.showWithGravity('Registered', ToastAndroid.LONG, ToastAndroid.TOP);

            // Go to login screen
            setTimeout(() => {
                router.replace('/auth/Login');
            }, 1000);
        })
        .catch((error) => {

            // Show notif
            ToastAndroid.showWithGravity(error.message, ToastAndroid.LONG, ToastAndroid.TOP);
        });
    }

    return (  
        <SafeAreaView style={styles.container}>

            <Stack.Screen options={{ headerShown: false }}/>

            {/* Back */}
            <TouchableOpacity style={styles.back} onPress={ () => router.replace('/auth/Login') }>
                <FontAwesome name={'chevron-left'} style={styles.backIcon}/>
            </TouchableOpacity>

            <View behavior={'height'} style={styles.body}>

                {/* Header */}
                <Text style={styles.headerText}>Sign Up</Text>

                {/* Fields */}
                <InputIcon icon={'user'} placeholder={'Username'} value={username} setValue={setUsername} />
                <InputIcon icon={'user'} placeholder={'First Name'} value={firstName} setValue={setFirstName} />
                <InputIcon icon={'user'} placeholder={'Last Name'} value={lastName} setValue={setLastName} />
                <InputIcon icon={'map-pin'} placeholder={'Address'} value={address} setValue={setAddress} />
                <InputIcon icon={'envelope-o'} placeholder={'Email'} value={email} setValue={setEmail} isSlimIcon={false} />
                <InputIcon icon={'lock'} placeholder={'Password'} value={password} setValue={setPassword} isSecure={true}/>

                <View style={styles.terms}>
                    <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked}/>
                    <Text style={{fontSize: 12, textAlign: 'center', width: '80%', justifyContent: 'center'}}>Check here to indicate that you have read and agree to the terms and conditions.</Text>
                </View>


                {/* Create Account */}
                <TouchableOpacity style={styles.register} onPress={handleRegisterPress}>
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <Text style={{fontSize: 12}}>Forgot Password?</Text>
                
            </View>
        
            <View style={styles.foot}>
                <View style={{flexDirection: 'row'}}>
                    {/* Don't have any account yet */}
                    <Text style={{fontSize: 12, marginRight: 5}}>Already have an account?</Text>
                    <Text style={{fontSize: 12, textDecorationLine: 'underline', color: '#389F4F'}} onPress={ () => router.replace('/auth/Login') }>Sign In</Text>
                </View>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    back: {
        height: 33,
        width: 33,
        position: 'absolute',
        left: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 30,
        marginTop: 30,
        borderWidth: 3,
        borderColor: '#097C31',
        borderRadius: 20
    },
    backIcon: {
        fontSize: 17,
        color: '#f8AF21',
        paddingRight: 2
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    foot: {
        marginBottom: 70
    },
    headerWrapper: {
        marginLeft: 'auto'
    },
    headerImage: {
        height: 122,
        width: 122
    },
    headerText: {
        fontSize: 25,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 50,
        marginBottom: 10,
        alignSelf: 'flex-start'
    },
    terms: {
        flexDirection: 'row',
        width: 250,
        marginBottom: 15
    },
    checkbox: {
        marginRight: 10,
    },
    register: {
        height: 42,
        width: 185,
        backgroundColor: '#389F4F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 10
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 19,
        textTransform: 'uppercase'
    }
});

export default Register;