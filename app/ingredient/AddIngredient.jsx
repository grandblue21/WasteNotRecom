import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, ToastAndroid } from 'react-native';
import { COLLECTIONS } from '../../constants';
import Navigation from '../../components/common/navigation/Navigation';
import Header from '../../components/common/header/Header';
import FirebaseApp from '../../helpers/FirebaseApp';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';
import getProfile from '../../hook/getProfile';

const AddIngredient = () => {
    
    const router = useRouter();
    const FBApp = new FirebaseApp();
    const { profile } = getProfile();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
    };
    const handleBarCodeScanned = async ({ data }) => {

        // Get Ingredient
        const existing = await FBApp.db.gets(COLLECTIONS.ingredients, {
            column: 'id',
            comparison: '==',
            value: data
        });

        setScanned(true);

        // New batch
        if (existing.filter(x => x.restaurantId == profile.adminId).length > 0) {
            router.replace(`/ingredient/add-batch/${existing[0].id}`);
        }
        // Add
        else {
            router.replace(`/ingredient/add-from-scan/${data}`);
        }
    };

    useEffect(() => {
        getBarCodeScannerPermissions();
    }, []);

    // No permission yet
    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>
    }

    // Permission denied
    if (hasPermission === false) {
        return <Text>No access to camera</Text>
    }

    return (
        <SafeAreaView style={styles.container}>

            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace('/inventory/Inventory') }}/>

            <View style={styles.body}>

                <BarCodeScanner
                    onBarCodeScanned={ scanned ? undefined : handleBarCodeScanned }
                    style={ StyleSheet.absoluteFillObject }
                />
                
                <Navigation currentRoute="Inventory"/>

            </View>
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    body: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingBottom: 5
    }
});


export default AddIngredient;