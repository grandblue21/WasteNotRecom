import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Search = () => {

    return (
        <View style={styles.inputIconWrapper}>
            <TouchableOpacity>
                <FontAwesome name={'search'} style={styles.inputIcon}/>
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder={'Search'}/>
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
        borderRadius: 50,
        marginBottom: 20,
        width: '92%',
        elevation: 10,
        marginHorizontal: '4%'
    },
    inputIcon: {
        fontSize: 28,
        marginHorizontal: 10,
        color: '#F8AF21'
    },
    input: {
        height: 49,
        fontSize: 20
    }
});

export default Search;