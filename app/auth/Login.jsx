import React, { useState } from 'react';
import { Keyboard, SafeAreaView, Image, Text, View, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import InputIcon from '../../components/auth/InputIcon';
import FirebaseApp from '../../helpers/FirebaseApp';
import { signInWithEmailAndPassword  } from 'firebase/auth';
import { ROLES, COLLECTIONS } from '../../constants';

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

            <View behavior={'height'} style={styles.body}>

                {/* Header */}
                <View style={styles.headerWrapper}>
                    <Image source={require('../../assets/images/logos/normal.png')} style={styles.headerImage}></Image>
                </View>
                <Text style={styles.headerText}>Login</Text>

                {/* Fields */}
                <InputIcon icon={'user-circle-o'} placeholder={'Username'} value={username} setValue={setUsername}  isSlimIcon={false} />
                <InputIcon icon={'lock'} placeholder={'Password'} value={password} setValue={setPassword} isSecure={true} />

                {/* Login */}
                <TouchableOpacity style={styles.login} onPress={handleLoginPress}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <Text style={{fontSize: 12}}>Forgot Password?</Text>

            </View>

            <View style={styles.foot}>
                <View style={{flexDirection: 'row'}}>
                    {/* Don't have any account yet */}
                    <Text style={{fontSize: 12, marginRight: 5}}>Don't have any account yet?</Text>
                    <Text style={{fontSize: 12, textDecorationLine: 'underline', color: '#389F4F'}} onPress={() => router.replace('/auth/Register')}>Sign Up</Text>
                </View>
            </View>

        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '-60%'
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        marginTop: -20,
        marginBottom: 10,
        alignSelf: 'flex-start'
    },
    login: {
        height: 40,
        width: 258,
        backgroundColor: '#389F4F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginBottom: 10
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 20,
    }
});

export default Login;