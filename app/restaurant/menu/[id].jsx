import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Header from '../../../components/common/header/Header';
import { FONT, COLORS, SIZES, COLLECTIONS, MENU_CATEGORIES, images } from '../../../constants';
import Navigation from '../../../components/common/navigation/Navigation';
import { useRouter } from 'expo-router';
import Categories from '../../../components/common/navigation/Categories';
import { useGlobalSearchParams } from 'expo-router';
import FirebaseApp from '../../../helpers/FirebaseApp';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { GOOGLE_MAP_API_KEY, GOOGLE_MAP_CONFIG } from '../../../constants';
import getMenu from '../../../hook/getMenu';

const RestaurantMenu = () => {

    const { id } = useGlobalSearchParams();
    const router = useRouter();
    const FBApp = new FirebaseApp();
    const [restaurant, setRestaurant] = useState({});
    const { menu, isLoading: isLM, refetch } = getMenu({ column: 'userId', comparison: '==', value: id });
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [menuList, setMenuList] = useState(menu);
    const handleCategoryChange = (index, category) => {
        setSelectedCategory(category);
        setMenuList(menu.filter((x) => (
            (category != 'All' && x.dishCategory.toLowerCase() == category.toLowerCase()) || category == 'All'
        )));
    };

    useEffect(() => {

        const get_latlng = async () => {
            
            try {
                const address = [restaurant.country, restaurant.restaurantCity, restaurant.restaurantBarangay, restaurant.restaurantStreetAddress].filter((x) => x).join(', ');
                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAP_API_KEY}&fields=geometry`);
                if (response.data.results.length > 0) {
                    const { lat, lng } = response.data.results[0].geometry.location;
                    await FBApp.db.update(COLLECTIONS.restaurants, { restaurantLat: lat, restaurantLng: lng }, restaurant.id);
                }
                else {
                    throw new Error('No results found');
                }
            }
            catch (error) {
                console.error('Error fetching location:', error);
            }
        }
        
        restaurant.id && !restaurant.restaurantLat && !restaurant.restaurantLng && GOOGLE_MAP_CONFIG.allow && get_latlng();
    }, [restaurant]);

    // Restaurant Use Effect
    useEffect(() => {
        const fetch_data = async () => {
            setRestaurant(await FBApp.db.get_from_ref(COLLECTIONS.restaurants, id));
        }

        fetch_data();
    }, []);

    useEffect(() => {
        
        const fetchData = () => {
            setMenuList(menu);
        }

        // Check if both are fetched
        if (!isLM) {
            fetchData();
        }
    }, [isLM]);
    
    return (
        <SafeAreaView style={ styles.container }>

            <Header title={ 'Menu' } showBack={{ show: true, handleBack: () => router.replace('/restaurant/RestaurantMarket') }}/>

            <View style={ styles.body }>

                <View style={ styles.mapContainer }>
                    <MapView
                        style={{ flex: 1 }}
                        provider={ PROVIDER_GOOGLE }
                        showsUserLocation
                        initialRegion={{
                            latitude: parseFloat(restaurant.restaurantLat ?? GOOGLE_MAP_CONFIG.default.latitude),
                            longitude: parseFloat(restaurant.restaurantLng ?? GOOGLE_MAP_CONFIG.default.longitude),
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421
                        }}
                    >
                        <Marker
                            coordinate={{ latitude: parseFloat(restaurant.restaurantLat ?? GOOGLE_MAP_CONFIG.default.latitude), longitude: parseFloat(restaurant.restaurantLng ?? GOOGLE_MAP_CONFIG.default.longitude) }}
                        />
                    </MapView>
                </View>

                <TouchableOpacity style={ styles.restaurantContainer } onPress={ () => router.replace(`/restaurant/details/${id}`) }>
                    <Image src={ restaurant.restaurantLogo ?? images.RESTAURANT_LOGO_PLACEHOLDER_IMG } style={ styles.restaurantImage }/>
                    <Text style={ styles.restaurantName } numberOfLines={ 2 } ellipsizeMode="tail">{ restaurant.restaurantName }</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <View style={ {marginBottom: 10 }}>
                        <Categories categories={ ['All', ...MENU_CATEGORIES] } onCategoryChange={ handleCategoryChange } />
                    </View>

                    <ScrollView style={ styles.restaurantIngredientsContainer }>
                    
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', flexWrap: 'wrap' }}>
                        {
                            menuList.length > 0 ? menuList.map((ingredient, index) => (
                                <TouchableOpacity key={ index } style={ styles.restaurantIngredient }>

                                    <Image src={ ingredient.imageUrl } style={ styles.ingredientImage }/>

                                    <View style={ styles.ingredientInfoContainer }>
                                        <View style={ styles.ingredientNameContainer }>
                                            <Text style={ styles.ingredientName } numberOfLines={ 1 } ellipsizeMode="tail">{ ingredient.dishName }</Text>
                                        </View>
                                    </View>

                                </TouchableOpacity>
                            )) : <Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ height: 200, width: 200 }} />
                        }
                        </View>

                    </ScrollView>
                </View>
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
        paddingBottom: 5,
        paddingVertical: 10
    },
    mapContainer: {
        height: 183,
        marginHorizontal: 10,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 28,
        overflow: 'hidden'
    },
    restaurantContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    restaurantImage: {
        height: 82,
        width: 90,
        borderRadius: 45,
        marginRight: 10
    },
    restaurantName: {
        fontSize: 23,
        fontWeight: '500',
        maxWidth: '70%'
    },
    restaurantIngredientsContainer: {
        flex: 1
    },
    restaurantIngredient: {
        height: 183,
        width: 135,
        marginBottom: 15
    },
    ingredientImage: {
        height: 140,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginBottom: 9,
    },
    ingredientNameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10
    },
    ingredientName: {
        fontSize: 15,
        fontWeight: '700',
        maxWidth: 80
    },
    ingredientLeft: {
        fontSize: 12,
        color: '#928D8D'
    },
    ingredientPriceContainer: {
        paddingLeft: 15,
        flexDirection: 'row'
    },
    ingredientPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary
    },
    ingredientPricePer: {
        marginLeft: 5
    }
});


export default RestaurantMenu;