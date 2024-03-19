import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, Text, Image, TextInput, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import Header from '../../components/common/header/Header';
import Search from '../../components/home/search/Search';
import { COLLECTIONS, COLORS } from '../../constants';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import getProfile from '../../hook/getProfile';
import FirebaseApp from '../../helpers/FirebaseApp';

const Wishlist = () => {

    const router = useRouter();
    const FBApp = new FirebaseApp();
    const { profile } = getProfile();
    const [wishlist, setWishlist] = useState([]);
    const [quantity, setQuantity] = useState([]);
    const [saleItems, setSaleItems] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantsFormatted, setRestaurantsFormatted] = useState([]);

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

    // UseEffect for Wishlist
    useEffect(() => {

        const fetchData = async () => {

            // Set sale Items
            setSaleItems(await Promise.all(wishlist.map(async (list) => {

                // Get item
                const item = await FBApp.db.get_from_ref(COLLECTIONS.sale_items, list.Sale_id);
                
                if (!item) {
                    return null;
                }

                // Get data
                item.data = await FBApp.db.get(COLLECTIONS.ingredients, {
                    column: 'ItemId',
                    comparison: '==',
                    value: item.ItemId
                });

                return item;
            }).filter(x => x)));

            // Set quantity
            setQuantity(wishlist.map(x => ({ [x.id]: x.Quantity })));
        }

        // Wishilst is loaded
        if (wishlist.length > 0) {
            fetchData();
        }
    }, [wishlist]);

    // UseEffect for Restaurants
    useEffect(() => {

        const fetchData = async () => {

            // Restaurants
            const rests = [...new Set(saleItems.map(x => x.Restaurant_Id))];console.log(rests);

            // Get restaurant details
            setRestaurants(await Promise.all(rests.map(async (res) => await FBApp.db.get_from_ref(COLLECTIONS.restaurants, res))));
        }

        // SaleItems is loaded
        if (saleItems.length > 0) {
            fetchData();
        }
    }, [saleItems]);

    // UseEffect for Wishlist Items formatted
    useEffect(() => {

        const fetchData = async () => {

            setRestaurantsFormatted(restaurants.map((rest) => {

                rest.items = saleItems.filter(x => x.Restaurant_Id == rest.id).map((items) => ({ ...items, wishlist: wishlist.find(x => x.Sale_id == items.id) }));

                return rest;
            }));
        }

        // Restaurants is loaded
        if (restaurants.length > 0) {
            fetchData();
        }
    }, [restaurants]);

    return (
        <SafeAreaView style={ styles.container }>

            <Header title="Wishlist" showBack={{ show: true, handleBack: () => router.replace('dashboard/Dashboard') }}/>

            <Search/>

            <ScrollView style={ styles.body }>
                
                {
                    restaurantsFormatted.map((restaurant, index) => (
                        <View style={ styles.restaurant } key={index}>

                            <View style={ styles.restaurantContainer }>
                                <Image src={ restaurant.restaurantLogo } style={ styles.restaurantImage }/>
                                <Text style={ styles.restaurantName } numberOfLines={ 2 } ellipsizeMode="tail">{ restaurant.restaurantName }</Text>
                            </View>

                            <ScrollView style={ styles.restaurantIngredients }>

                                {
                                    restaurant.items.map((item, i) => (
                                        <View style={ styles.ingredient } key={i}>
                                            <Image style={ styles.ingredientImage } src={ item.data.image }/>
                                            <View style={{ flex: 1 }}>
                                                <View style={ styles.ingredientHeader }>
                                                    <Text style={ styles.ingredientName }>{ item.data.Item_name }</Text>
                                                    <View style={ styles.actionContainer }>
                                                        <TouchableOpacity  onPress={ async () => {

                                                            // Update wishlist
                                                            await FBApp.db.update(COLLECTIONS.wishlist, { Quantity: quantity.find(x => Object.keys(x).includes(item.wishlist.id))[item.wishlist.id] }, item.wishlist.id);

                                                            // Update quantity
                                                            await FBApp.db.update(COLLECTIONS.sale_items, { Quantity: parseFloat(item.Quantity) + parseFloat(item.wishlist.Quantity) - quantity.find(x => Object.keys(x).includes(item.wishlist.id))[item.wishlist.id] }, item.id);
                                                            
                                                            // Show notif
                                                            ToastAndroid.showWithGravity('Wishlist Updated', ToastAndroid.LONG, ToastAndroid.TOP);

                                                            // Reload
                                                            router.replace(`/wishlist/Wishlist`);
                                                        } }>
                                                            <FontAwesome name="pencil" style={ styles.editIcon } />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={ () => (
                                                            Alert.alert(
                                                                'Remove Wishlist',
                                                                'Are you sure you want to perform this action?',
                                                                [
                                                                    {
                                                                        text: 'Cancel',
                                                                        style: 'cancel',
                                                                    },
                                                                    {
                                                                        text: 'Remove',
                                                                        onPress: async () => {
                                                                            try {

                                                                                // Remove wishlist
                                                                                await FBApp.db.delete(COLLECTIONS.wishlist, item.wishlist.id);

                                                                                // Update quantity
                                                                                await FBApp.db.update(COLLECTIONS.sale_items, { Quantity: parseFloat(item.Quantity) + parseFloat(item.wishlist.Quantity) }, item.id);

                                                                                // Show notif
                                                                                ToastAndroid.showWithGravity('Wishlist Removed', ToastAndroid.LONG, ToastAndroid.TOP);

                                                                                // Reload
                                                                                router.replace(`/wishlist/Wishlist`);
                                                                            }
                                                                            catch (error) {
                                                                                console.log(error);
                                                                            }
                                                                        }
                                                                    }
                                                                ],
                                                                { cancelable: false }
                                                            )
                                                        ) }>
                                                            <FontAwesome name="trash" style={ styles.deleteIcon } />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <Text style={ styles.ingredientPrice }>Price: ₱ { item.Price.toLocaleString(undefined, { minimumFractionDigits: 2 }) } per Kg.</Text>
                                                <View style={ styles.infoContainer}>
                                                    <View style={ styles.quantityContainer }>
                                                        <TextInput style={ styles.quantity } value={ quantity.find(x => Object.keys(x).includes(item.wishlist.id))[item.wishlist.id].toString() } onChangeText={ input => setQuantity([ ...quantity.filter(x => !Object.keys(x).includes(item.wishlist.id)), { [item.wishlist.id]: input } ]) }/>
                                                    </View>
                                                    <View style={ styles.infoTotalContainer }>
                                                        <Text style={ styles.infoTotal }>/{ item.Quantity }</Text>
                                                        <Text style={ styles.infoLeft }>kg Available</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                }

                            </ScrollView>

                        </View>
                    ))
                }

            </ScrollView>

            <View style={ styles.totalContainer }>
                <Text style={ styles.totalLabel }>Total:</Text>
                <Text style={ styles.total }>₱{ (saleItems.filter(x => x).reduce((total, current) => parseFloat(current.Price) * parseFloat(wishlist.find(x => x.Sale_id == current.id).Quantity) + total, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 }) }</Text>
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFF',
    },
    body: {
        flex: 1,
        paddingHorizontal: 5,
        marginBottom: 80
    },
    restaurant: {
        marginBottom: 10,
    },
    restaurantContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: 10
    },
    restaurantImage: {
        height: 99,
        width: 99,
        borderRadius: 45,
        marginRight: 10
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: '500',
        maxWidth: '70%'
    },
    restaurantIngredients: {
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderColor: COLORS.primary,
        minHeight: 115,
        maxHeight: 300,
        paddingVertical: 10
    },
    ingredient: {
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 32,
        paddingVertical: 20,
        paddingHorizontal: 10
    },
    ingredientImage: {
        height: 105,
        width: 105,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
        borderRadius: 25
    },
    ingredientHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    actionContainer: {
        flexDirection: 'row',
    },
    editIcon: {
        color: COLORS.primary,
        fontSize: 24,
        marginRight: 5
    },
    deleteIcon: {
        color: 'red',
        fontSize: 24
    },
    ingredientName: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    ingredientPrice: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    quantityContainer: {
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        height: 28,
        width: 57,
        marginRight: 5,
        paddingHorizontal: 10
    },
    quantity: {
        flex: 1,
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    infoTotalContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    infoTotal: {
        fontSize: 25,
        fontWeight: 'bold',
        marginRight: 5
    },
    infoLeft: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    totalContainer: {
        height: 71,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 10
    },
    totalLabel: {
        fontSize: 40,
        marginRight: 10,
        color: '#FFF',
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        fontWeight: '900'
    },
    total: {
        fontSize: 35,
        fontWeight: 'bold'
    }
});

export default Wishlist;