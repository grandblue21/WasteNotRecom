import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ToastAndroid, Keyboard } from 'react-native';
import ScreenHeaderBtn from '../../components/common/header/ScreenHeaderBtn';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { COLORS, COLLECTIONS } from '../../constants';
import getProfile from '../../hook/getProfile';
import FirebaseApp from '../../helpers/FirebaseApp';

const EditProfile = () => {

    const router = useRouter();
    const profile = getProfile().profile;
    const [firstName, setFirstName] = useState(profile.first_name);
    const [lastName, setLastName] = useState(profile.last_name);
    const [email, setEmail] = useState(profile.email);
    const [phone, setPhone] = useState(profile.phone);
    const [address, setAddress] = useState(profile.address);
    const handleConfirm = async () => {

        // Remove keyboard
        Keyboard.dismiss();

        // Set firebase instance
        const FBApp = new FirebaseApp();

        try {

            const new_profile = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                contactNum: phone,
                address: address
            }
            
            // Update DB
            await FBApp.db.update(COLLECTIONS.user, new_profile, profile.id);

            // Update Session
            await FBApp.session.set('user', JSON.stringify({ ...profile, ...new_profile }));

            // Reroute to profile
            router.replace('/profile/Profile');

            ToastAndroid.showWithGravity('Profile updated', ToastAndroid.LONG, ToastAndroid.TOP);
            
        } catch (error) {
            // ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.TOP);
            console.log(error)
        }
    }

    // Runs after profile has been loaded
    useEffect(() => {
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setEmail(profile.email);
        setPhone(profile.contactNum);
        setAddress(profile.address);
    }, [profile]);

    return (
        <View style={ styles.container }>

            <Stack.Screen options={{
                headerStyle: { backgroundColor: '#FFF' },
                headerShadowVisible: false,
                headerLeft: () => <ScreenHeaderBtn handlePress={ () => router.back() } component={(
                    <View style={ styles.back }>
                        <FontAwesome name={'chevron-left'} style={ styles.backIcon }/>
                    </View>
                )} />,
                headerRight: null,
                headerTitle: () => null
            }}/>

            <View style={ styles.body }>
                
                <TouchableOpacity style={ styles.imageContainer }>
                    <Image src={ profile.imageUrl ?? 'https://cdn-icons-png.flaticon.com/512/666/666201.png' } style={ styles.image }/>
                </TouchableOpacity>

                <Text style={ styles.nameHeader }>Edit</Text>

                <View style={ styles.infoContainer }>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>First Name:</Text>
                        <TextInput style={ styles.infoInput } value={ firstName } placeholder="First Name" onChangeText={ (input) => setFirstName(input) }/>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Last Name:</Text>
                        <TextInput style={ styles.infoInput } value={ lastName } placeholder="Last Name" onChangeText={ (input) => setLastName(input) }/>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Gmail:</Text>
                        <TextInput style={ styles.infoInput } value={ email } placeholder="Email" onChangeText={ (input) => setEmail(input) }/>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Phone Number:</Text>
                        <TextInput style={ styles.infoInput } value={ phone } placeholder="Number" onChangeText={ (input) => setPhone(input) }/>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Address:</Text>
                        <TextInput style={ styles.infoInput } value={ address } placeholder="Location" onChangeText={ (input) => setAddress(input) }/>
                    </View>

                </View>

                <View style={ styles.buttonContainer }>
                    <TouchableOpacity style={ styles.cancelButton } onPress={ () => router.back() }>
                        <Text style={ styles.buttonText }>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ styles.confirmButton } onPress={ handleConfirm }>
                        <Text style={ styles.buttonText }>Confirm</Text>
                    </TouchableOpacity> 
                </View>

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    body: {
        flex: 1,
        alignItems: 'center'
    },
    back: {
        height: 38,
        width: 38,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
        marginTop: 6,
        borderWidth: 3,
        borderColor: '#097C31',
        borderRadius: 20
    },
    backIcon: {
        fontSize: 17,
        color: '#f8AF21',
        paddingRight: 2
    },
    editBtnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 38,
        height: 38,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 38,
    },
    editBtn: {
        fontSize: 23,
        color: COLORS.primary
    },
    imageContainer: {
        height: 189,
        width: 189,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 95,
        padding: 20,
        marginBottom: 15
    },
    image: {
        flex: 1
    },
    nameHeader: {
        fontSize: 40,
        color: '#FFF',
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        fontWeight: '900',
        marginBottom: 55
    },
    infoContainer: {
        flex: 1
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        marginRight: 20
    },
    infoLabel: {
        textAlign: 'right',
        textDecorationLine: 'underline',
        fontSize: 15,
        width: '40%',
        marginRight: 10
    },
    infoInput: {
        fontSize: 20,
        fontWeight: '600',
        width: '60%',
        height: 40,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 30,
        paddingHorizontal: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        marginHorizontal: 2,
        marginBottom: 30
    },
    cancelButton: {
        flexGrow: 1,
        borderWidth: 1,
        height: 61,
        borderColor: '#B20000',
        marginRight: 1.5,
        borderRadius: 7,
        backgroundColor: '#ED5E5E',
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmButton: {
        flexGrow: 1,
        borderWidth: 1,
        height: 61,
        borderColor: '#FFF',
        marginRight: 1.5,
        borderRadius: 7,
        backgroundColor: '#48B560',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 25,
        color: 'white',
        fontWeight: '500'
    }
});

export default EditProfile;