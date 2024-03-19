import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const InputIcon = ({ icon, placeholder, value, setValue, isSecure = false, isSlimIcon = true }) => {

    return (
        <View style={styles.inputIconWrapper}>
            <FontAwesome name={icon} style={isSlimIcon ? styles.inputIconSlim : styles.inputIconWide}/>
            <TextInput style={styles.input} placeholder={placeholder} onChangeText={input => setValue(input)} value={value} secureTextEntry={isSecure}/>
        </View>
    )
}

const styles = StyleSheet.create({
    inputIconWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#389F4F',
        borderRadius: 5,
        marginBottom: 20,
        width: 300,
        elevation: 10
    },
    inputIconSlim: {
        width: 35,
        fontSize: 31,
        marginHorizontal: 10,
        paddingLeft: 5,
        color: '#389F4F'
    },
    inputIconWide: {
        width: 35,
        fontSize: 31,
        marginHorizontal: 10,
        color: '#389F4F'
    },
    input: {
        height: 45,
    }
});

export default InputIcon;