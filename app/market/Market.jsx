import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Header from '../../components/common/header/Header';
import { images, COLLECTIONS, SIZES } from '../../constants';
import Search from '../../components/home/search/Search';
import Navigation from '../../components/common/navigation/Navigation';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import getRestaurants from '../../hook/getRestaurants';
import { useEffect, useState } from 'react';
import FirebaseApp from '../../helpers/FirebaseApp';

const Market = () => {

    const router = useRouter();
    const FBApp = new FirebaseApp();
    const { restaurants } = getRestaurants();
    const [saleItems, setSaleItems] = useState([]);

    useEffect(() => {

        const getSaleItems = async () => {
            
            // Iterate
            Promise.all(restaurants.map(async (x) => await FBApp.db.gets(COLLECTIONS.sale_items, {
                column: 'Restaurant_Id',
                comparison: '==',
                value: x.id
            }))).then(([x]) =>x.length > 0 && setSaleItems([...saleItems, ...x]));
        }

        // Restaurants
        if (restaurants.length > 0) {
            getSaleItems();
        }
    }, [restaurants]);

    return (
        <SafeAreaView style={ styles.container }>

            <Header title={ 'Market' }/>

            <View style={ styles.body }>

                <Search/>
            
                <ScrollView style={ styles.restaurantsContainer }>

                    <Text style={ styles.headerText }>Restaurants</Text>

                    {
                        restaurants.length > 0 ? restaurants.map((restaurant, index) => (
                            <TouchableOpacity key={ index } style={ styles.restaurant } onPress={ () => router.replace(`/restaurant/menu/${restaurant.id}`) }>

                                <Image src={ restaurant.restaurantLogo ?? images.RESTAURANT_LOGO_PLACEHOLDER_IMG } style={ styles.restaurantImage }/>

                                <Text style={ styles.restaurantName }>{ restaurant.restaurantName }</Text>

                                <View style={ styles.restaurantViewContainer }>
                                    <Text style={ styles.restaurantViewText } numberOfLines={ 1 }>Tap to View</Text>
                                    <FontAwesome name="chevron-right" style={ styles.restaurantViewIcon }/>
                                </View>
                                
                            </TouchableOpacity>
                        )) : <Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ alignSelf: 'center', flex: 1, height: 160, width: 160 }} />
                    }

                </ScrollView>

            </View>

            <Navigation currentRoute={ 'Market' } />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    body: {
        flex: 1,
        padding: SIZES.medium,
        height: 100,
        marginBottom: 60,
        paddingBottom: 5
    },
    restaurantsContainer: {
        flex: 1,
        paddingHorizontal: 10
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 10,
        marginBottom: 5
    },
    restaurant: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ededed',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 12
    },
    restaurantImage: {
        width: 59,
        height: 64,
        marginRight: 10,
        borderRadius: 30
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: '600',
    },
    restaurantViewContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        right: 0,
        marginRight: 10,
        marginBottom: 10
    },
    restaurantViewText: {
        fontSize: 10,
        textDecorationLine: 'underline',
        marginRight: 5,
        fontWeight: '600'
    },
    restaurantViewIcon: {
        fontSize: 7,
        marginTop: 2
    }
});


export default Market;