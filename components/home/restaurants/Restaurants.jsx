import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { images, COLORS, FONT, SIZES } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import getRestaurants from '../../../hook/getRestaurants';
import { useRouter } from 'expo-router';

const Restaurants = () => {

    const router = useRouter();
    const { restaurants } = getRestaurants();

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Restaurants</Text>
                <TouchableOpacity style={styles.seeAllContainer} onPress={ () => router.replace('/restaurant/RestaurantMarket') }>
                    <Text style={styles.seeAllText}>See All</Text>
                    <FontAwesome name="chevron-right" style={styles.seeAllIcon}/>
                </TouchableOpacity>
            </View>

            <View style={styles.restaurantContainer}>
                {
                    restaurants.length > 0 ? <>
                        <FlatList
                            data={ restaurants }
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={ () => router.replace(`/restaurant/menu/${item.id}`) }>
                                    <Image src={ item.restaurantLogo ?? images.RESTAURANT_LOGO_PLACEHOLDER_IMG } style={styles.restaurant} />
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index}
                            contentContainerStyle={{ columnGap: SIZES.medium }}
                            horizontal
                        />
                    </> : <Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ ...styles.restaurant, alignSelf: 'center' }} />
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 5
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONT.medium
    },
    seeAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    seeAllText: {
        fontSize: 15,
        textDecorationLine: 'underline',
        marginRight: 5
    },
    seeAllIcon: {
        fontSize: 12,
        marginTop: 2
    },
    restaurantContainer: {
        paddingVertical: 10,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        marginBottom: 5,
        borderColor: COLORS.primary
    },
    restaurant: {
        height: 111,
        width: 102,
        borderRadius: 61,
        backgroundColor: 'white'
    }
});

export default Restaurants;