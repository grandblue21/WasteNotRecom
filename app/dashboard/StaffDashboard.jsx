import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList, SafeAreaView } from 'react-native';
import { SIZES } from '../../constants';
import Header from '../../components/common/header/Header';
import Search from '../../components/home/search/Search';
import Board from '../../components/home/board/Board';
import TopDishes from '../../components/home/top-dishes/TopDishes';
import Inventory from '../../components/home/inventory/Inventory';
import Navigation from '../../components/common/navigation/Navigation';
import SaleItems from '../../components/home/sale-items/SaleItems';
import { useRouter } from 'expo-router';
import FirebaseApp from '../../helpers/FirebaseApp';

const StaffDashboard = () => {

    const router = useRouter();

    const data = Array.from({ length: 5 });
    
    return (
        <SafeAreaView style={styles.container}>

            <Header title={ 'Home' }/>

            <ScrollView style={styles.body}>

                <Search/>
            
                <Board/>

                <TopDishes/>
                
                <Inventory/>

                <SaleItems/>

            </ScrollView>

            <Navigation currentRoute={ 'Home' } />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    body: {
        padding: SIZES.medium,
        height: 100,
        marginBottom: 60,
        paddingBottom: 5
    }
});

export default StaffDashboard;