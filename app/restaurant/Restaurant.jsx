import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Header from '../../components/common/header/Header';
import { FONT, COLORS, SIZES } from '../../constants';
import Navigation from '../../components/common/navigation/Navigation';
import { useRouter } from 'expo-router';
import Categories from '../../components/common/navigation/Categories';

const Restaurant = () => {

    const router = useRouter();//

    const categories = ['All', 'Top Selling', 'Meat', 'Vegetables', 'Spices'];

    const ingredients = [{
        image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml',
        name: 'Rib Eye',
        stock: {
            quantity: 10,
            measurement: 'kg'
        },
        price: 1500
    }, {
        image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.ocean-treasure.com%2Fwp-content%2Fuploads%2F2021%2F06%2FMilkfish.jpg&f=1&nofb=1&ipt=178994be6d1a68c4cc4f988d16d17135ae3e2de9ad801ac84fe85c1564a5ae16&ipo=images',
        name: 'Milk Fish',
        stock: {
            quantity: 10,
            measurement: 'kg'
        },
        price: 2500
    }, {
        image: 'https://cdn.mos.cms.futurecdn.net/iC7HBvohbJqExqvbKcV3pP.jpg',
        name: 'Potato',
        stock: {
            quantity: 10,
            measurement: 'kg'
        },
        price: 1500
    }, {
        image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.eatthismuch.com%2Fsite_media%2Fimg%2F480_erin_m_f8b9278d-504f-454b-b953-1a11fb2ba512.png&f=1&nofb=1&ipt=cd8041b164d69e14cf786f478770e5ccdf63c15503a5c30747de04c6e24b26e2&ipo=images',
        name: 'Chicken Thigh',
        stock: {
            quantity: 10,
            measurement: 'kg'
        },
        price: 2500
    }];
    
    return (
        <SafeAreaView style={ styles.container }>

            <Header title={ 'Market' } showBack={{ show: true, handleBack: () => router.replace('/market/Market') }}/>

            <View style={ styles.body }>

                <View style={ styles.mapContainer }>
                    <Image source={{ uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.thestatesman.com%2Fwp-content%2Fuploads%2F2020%2F04%2Fgoogl_ED.jpg&f=1&nofb=1&ipt=ca3fae3cb793b008ec922ea8e528452c037e38229642aa1708c2ff6e37eeb50f&ipo=images' }} style={{ flex: 1 }}/>
                </View>

                <TouchableOpacity style={ styles.restaurantContainer } onPress={ () => router.replace('/restaurant/RestaurantDetails') }>
                    <Image source={{ uri: 'https://marketplace.canva.com/EAFpeiTrl4c/1/0/1600w/canva-abstract-chef-cooking-restaurant-free-logo-9Gfim1S8fHg.jpg' }} style={ styles.restaurantImage }/>
                    <Text style={ styles.restaurantName } numberOfLines={ 2 } ellipsizeMode="tail">Restaurant Sample</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <View style={ {marginBottom: 10 }}>
                        <Categories categories={ categories }/>
                    </View>

                    <ScrollView style={ styles.restaurantIngredientsContainer }>
                    
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', flexWrap: 'wrap' }}>
                        {
                            ingredients.map((ingredient, index) => (
                                <TouchableOpacity key={ index } style={ styles.restaurantIngredient } onPress={ () => router.push('/restaurant/IngredientCart') }>

                                    <Image source={{ uri: ingredient.image }} style={ styles.ingredientImage }/>

                                    <View style={ styles.ingredientInfoContainer }>
                                        <View style={ styles.ingredientNameContainer }>
                                            <Text style={ styles.ingredientName } numberOfLines={ 1 } ellipsizeMode="tail">{ ingredient.name }</Text>
                                            <Text style={ styles.ingredientLeft }>In store: { ingredient.stock.quantity  + ingredient.stock.measurement }</Text>
                                        </View>
                                        <View style={ styles.ingredientPriceContainer }>
                                            <Text style={ styles.ingredientPrice }>₱{ ingredient.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) }</Text>
                                            <Text style={ styles.ingredientPricePer }>per { ingredient.stock.measurement }</Text>
                                        </View>
                                    </View>

                                </TouchableOpacity>
                            ))
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
        paddingLeft: 15
    },
    ingredientPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary
    },
    ingredientPricePer: {

    }
});


export default Restaurant;