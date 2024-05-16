import { useState, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, View, Text, StyleSheet, Image, Keyboard, ToastAndroid, TextInput } from 'react-native';
import Header from '../../../components/common/header/Header';
import { COLORS, SIZES, COLLECTIONS } from '../../../constants';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import FirebaseApp from '../../../helpers/FirebaseApp';
import getProfile from '../../../hook/getProfile';
import { gramsToKg } from '../../../helpers/Converter';

const IngredientCart = () => {

    const router = useRouter();
    const { id } = useGlobalSearchParams();
    const FBApp = new FirebaseApp();
    const { profile } = getProfile();
    const [saleItem, setSaleItem] = useState({});
    const [wishlist, setWishlist] = useState([]);
    const handleConfirm = async () => {

        Keyboard.dismiss();

        // Add to wishlist
        const result = await FBApp.db.insert(COLLECTIONS.wishlist, {
            Sale_id: id,
            User_id: profile.userId
        });

        // Check if inserted
        if (!result) {
             // Show notif
            ToastAndroid.showWithGravity('Failed to add wishlist', ToastAndroid.LONG, ToastAndroid.TOP);

            return false;
        }

        // Show notif
        ToastAndroid.showWithGravity('Added to wishlist', ToastAndroid.LONG, ToastAndroid.TOP);

        // Redirect to ingredients
        router.replace('/wishlist/Wishlist');
    }

    // Useeffect for Wishist
    useEffect(() => {

        const fetchData = async () => {

            // Get wishlist
            setWishlist(await FBApp.db.gets(COLLECTIONS.wishlist, {
                column: 'User_id',
                comparison: '==',
                value: profile.userId
            }));
        }

        // Profile is loaded
        if (profile.id) {
            fetchData();
        }
    }, [profile]);

    // Get sale item
    useEffect(() => {

        const fetchData = async () => {
            setSaleItem(await FBApp.db.get_from_ref(COLLECTIONS.sale_items, id));
        }

        fetchData();
    }, []);

    // Get sale item item details
    useEffect(() => {

        const fetchData = async () => {
            const item = await FBApp.db.get(COLLECTIONS.ingredients, {
                column: 'ItemId',
                comparison: '==',
                value: saleItem.ItemId
            });

            setSaleItem({ ...saleItem, data: item });
        }

        // Get Item if saleItem is loaded and item data is not
        if (saleItem.id && !saleItem.data) {
            fetchData();
        }
    }, [saleItem]);
    
    return (
        <SafeAreaView style={ styles.container }>

            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace(`/restaurant/market/${saleItem.Restaurant_Id}`) }}/>

            <View style={ styles.body }>

                <Image src={ saleItem.data && saleItem.data.image } style={ styles.ingredientImage }/>
                
                <View style={ styles.detailsContainer }>
                    
                    <View style={ styles.detail }>

                        <Text style={ styles.detailLabel }>Name</Text>
                        <TextInput style={ styles.detailInput } value={ saleItem.data && saleItem.data.Item_name } editable={false}/>

                    </View>

                    <View style={{ ...styles.detail, justifyContent: 'flex-start' }}>

                        <Text style={ styles.detailLabel }>Price</Text>
                        <TextInput style={{ ...styles.detailInput, width: '40%' }} value={ '₱' + (saleItem.Price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) } editable={false}/>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', marginLeft: 5 }}>per Kg</Text>

                    </View>

                </View>

                <View style={ styles.buttonContainer }>
                    <TouchableOpacity style={ styles.cancelButton } onPress={ () => router.back() }>
                        <Text style={ styles.buttonText }>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ styles.confirmButton } onPress={ handleConfirm } disabled={ wishlist.find((x) => x.Sale_id == id) ? true : false }>
                        <Text style={ styles.buttonText }>{ wishlist.find((x) => x.Sale_id == id) ? 'Already in Wishlist' : 'TO Wishlist' }</Text>
                    </TouchableOpacity>
                </View>

            </View>
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    body: {
        padding: SIZES.small
    },
    ingredientImage: {
        height: 187,
        width: 187,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 93,
        marginBottom: 40
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    detailLabel: {
        fontSize: 25,
        marginRight: 10
    },
    detailInput: {
        fontSize: 20,
        fontWeight: '600',
        width: '80%',
        height: 47,
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
        width: '50%',
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
        width: '50%',
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
        fontWeight: '500',
        textAlign: 'center'
    }
});


export default IngredientCart;