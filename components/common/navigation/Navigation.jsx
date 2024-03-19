import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS, FONT, ROLES } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import getProfile from '../../../hook/getProfile';

const Navigation = ({ currentRoute, logout }) => {

    const router = useRouter();

    const [activeNavigation, setActiveNavigation] = useState(currentRoute);

    const { profile } = getProfile();

    // Navigation List
    const NAVIGATIONS = [{
        icon: 'home',
        name: 'Home',
        applicable_roles: [ROLES.customer, ROLES.staff],
        navigate: () => router.replace(profile.role == ROLES.customer ? '/dashboard/Dashboard' : '/dashboard/StaffDashboard')
    }, {
        icon: 'shopping-basket',
        name: 'Market',
        applicable_roles: [ROLES.customer],
        navigate: () => router.replace('/market/Market')
    }, {
        icon: 'list-alt',
        name: 'Menu',
        applicable_roles: [ROLES.staff],
        navigate: () => router.replace('/menu/Menu')
    }, {
        icon: 'wechat',
        name: 'Chat-bot',
        applicable_roles: [ROLES.customer],
        navigate: () => router.replace('/chatbot/Chatbot')
    }, {
        icon: 'home',
        name: 'Inventory',
        applicable_roles: [ROLES.staff],
        navigate: () => router.replace('/inventory/Inventory', { restaurant: profile.adminId })
    }, {
        icon: 'shopping-basket',
        name: 'Market',
        applicable_roles: [ROLES.staff],
        navigate: () => router.replace('/market/StaffMarket')
    }, {
        icon: 'shopping-basket',
        name: 'Wishlist',
        applicable_roles: [ROLES.customer],
        navigate: () => router.replace('/wishlist/Wishlist')
    }, {
        icon: 'user-circle-o',
        name: 'Profile',
        applicable_roles: [ROLES.customer, ROLES.staff],
        navigate: () => router.replace('/profile/Profile')
    }];

    function handlePress(selectedNavigation) {
        setActiveNavigation(selectedNavigation.name);
        selectedNavigation.navigate();
    }

    return (
        <View style={styles.container}>
            {
                NAVIGATIONS.map((nav, index) => (
                    nav.applicable_roles.includes(profile.role) && <TouchableOpacity key={ index } style={ styles.button } onPress={ () => handlePress(nav) }>
                        <FontAwesome name={ nav.icon } style={ styles.buttonIcon(nav.name, activeNavigation) } />
                        <Text style={ styles.buttonText(nav.name, activeNavigation) }>{ nav.name }</Text>
                    </TouchableOpacity>
                ))
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 40
    },
    button: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonIcon: (name, activeNav) => ({
        color: name === activeNav ? COLORS.primary : '#B1BEB4',
        fontSize: 26
    }),
    buttonText: (name, activeNav) => ({
        color: name === activeNav ? COLORS.primary : '#B1BEB4',
        fontFamily: FONT.medium,
        fontSize: 12
    })
});

export default Navigation;