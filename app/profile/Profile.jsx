import { useState } from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableOpacity } from 'react-native';
import ScreenHeaderBtn from '../../components/common/header/ScreenHeaderBtn';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import Navigation from '../../components/common/navigation/Navigation';
import getProfile from '../../hook/getProfile';
import { Menu, Provider } from 'react-native-paper';
import FirebaseApp from '../../helpers/FirebaseApp';

const CustomDropdown = () => {

    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const handleMenuItemPress = async (item) => {

        switch (item) {
            case 'logout':

                const FBApp = new FirebaseApp();

                // Clear session
                await FBApp.session.remove('user');

                // Go to Login
                router.replace('/auth/Login');

                break;
        }

        closeMenu();
    };

    return (
        <Provider>
            <Menu
                visible={ visible }
                onDismiss={ closeMenu }
                statusBarHeight="0"
                anchor={(
                    <TouchableOpacity onPress={ openMenu }>
                        <FontAwesome name="gear" style={{ fontSize: 30, color: COLORS.primary }}/>
                    </TouchableOpacity>
                )}
            >
                <Menu.Item onPress={ () => handleMenuItemPress('logout') } title="Logout" style={{ backgroundColor: '#FFF' }} titleStyle={{ fontWeight: 'bold', color: 'red' }}/>
            </Menu>
        </Provider>
    );
};

const Profile = () => {

    const router = useRouter();
    const { profile } = getProfile();console.log(profile.imageUrl);

    return (
        <View style={ styles.container }>

            <Stack.Screen options={{
                headerStyle: { backgroundColor: '#FFF' },
                headerShadowVisible: false,
                headerLeft: () => <ScreenHeaderBtn component={(
                    <CustomDropdown/>
                )} />,
                headerRight: () => <ScreenHeaderBtn handlePress={ () => router.push('/profile/EditProfile') } component={(
                    <View style={ styles.editBtnContainer } >
                        <FontAwesome name="pencil" style={ styles.editBtn } />
                    </View>
                )} />,
                headerTitle: () => null
            }}/>

            <View style={ styles.body }>
                <TouchableOpacity style={ styles.imageContainer }>
                    <Image src={ profile.imageUrl ?? 'https://cdn-icons-png.flaticon.com/512/666/666201.png' } style={ styles.image }/>
                </TouchableOpacity>

                <Text style={ styles.nameHeader }>{ [profile.firstName, profile.lastName].join(' ') }</Text>

                <View style={ styles.infoContainer }>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Name:</Text>
                        <Text style={ styles.infoText }>{ [profile.firstName, profile.lastName].join(' ') }</Text>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Gmail:</Text>
                        <Text style={ styles.infoText }>{ profile.email }</Text>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Phone Number:</Text>
                        <Text style={ styles.infoText }>{ profile.contactNum ?? 'None' }</Text>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Address:</Text>
                        <Text style={ styles.infoText }>{ profile.address ?? 'Not given' }</Text>
                    </View>

                </View>

            </View>

            <Navigation currentRoute={ 'Profile' }/>

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
        marginBottom: 15,
        overflow: 'hidden'
    },
    image: {
        flex: 1,
        borderRadius: 90
    },
    nameHeader: {
        fontSize: 40,
        color: '#FFF',
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        fontWeight: '900',
        marginBottom: 55,
        textAlign: 'center'
    },
    infoContainer: {
        flex: 1
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 35
    },
    infoLabel: {
        paddingLeft: 20,
        textDecorationLine: 'underline',
        fontSize: 15,
        width: '40%',
        marginRight: 10
    },
    infoText: {
        fontSize: 20,
        fontWeight: '600',
        width: '60%'
    }
});

export default Profile;