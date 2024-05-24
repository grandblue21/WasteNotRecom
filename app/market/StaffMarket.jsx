import { StyleSheet, Text, View, ScrollView , FlatList, Image, TouchableOpacity, ToastAndroid, Alert} from 'react-native';
import React, { useState, useEffect } from 'react';
import Categories from '../../components/common/navigation/Categories';
import { MaterialIcons,FontAwesome,AntDesign } from '@expo/vector-icons';
import Header from '../../components/common/header/Header';
import Search from '../../components/home/search/Search';
import Navigation from '../../components/common/navigation/Navigation';
import { images, CATEGORIES, COLLECTIONS, COLORS } from '../../constants';
import getSaleItems from '../../hook/getSaleItems';
import getProfile from '../../hook/getProfile';
import FirebaseApp from '../../helpers/FirebaseApp';
import { useRouter } from 'expo-router';

const MarketScreen = () => {

    const router = useRouter();
    const FBApp = new FirebaseApp();
    const [selectedCategory, setSelectedCategory] = useState(0);
    const { profile, isLoading } = getProfile();
    const { saleItems, isLSI, refetch } = getSaleItems({
        column: 'Restaurant_Id',
        comparison: '==',
        value: profile.adminId
    });
    const [marketItems, setMarketItems] = useState([]);
    const [marketItemsList, setMarketItemsList] = useState([]);
    const handleCategoryChange = (index, category) => {
        setSelectedCategory(index);
        setMarketItems(marketItemsList.filter((x) => (
            (category != 'All' && x.data.category == category) || category == 'All'
        )));
    };

    // Gets ingredients if profile and sale items are loaded
    useEffect(() => {

        const getData = async () => {
            const items = await FBApp.db.gets(COLLECTIONS.ingredients, {
                column: 'ItemId',
                comparison: 'in',
                value: saleItems.map(x => x.ItemId)
            });
            
            // Include to data
            setMarketItems(saleItems.map((item) => ({ ...item, data: items.find(x => x.ItemId == item.ItemId) })));
            setMarketItemsList(saleItems.map((item) => ({ ...item, data: items.find(x => x.ItemId == item.ItemId) })));
        }

        // Get data if both are fetched
        if (saleItems.length > 0 && !isLoading && !isLSI) {
            getData();
        }
    }, [isLoading, isLSI, saleItems]);

    // Fetches sale items if profile is loaded
    useEffect(() => {
        // Refetch if profile is loaded
        if (profile.adminId) {
            refetch();
        }
    }, [profile.adminId]);console.log(marketItems);

    return (
        <View style={ styles.container }>
            <Header title="Market"/>
            <Search/>
            <View style={ styles.body }>
                <View style={ styles.contentContainer }>
                    <Categories categories={ ['All', ...CATEGORIES] } onCategoryChange={ handleCategoryChange } />
                    {
                        marketItems.length > 0 ? <>
                            <FlatList
                                showsVerticalScrollIndicator={ false }
                                data={ marketItems }
                                keyExtractor={ (item, index) => index }
                                numColumns={ 2}
                                renderItem={ ({ item }) => item.data && (
                                    <View style={ styles.marketItem }>
                                        <View style={ styles.marketItemContainer }>
                                            <Image src={ item.data.image } style={ styles.marketImage } />
                                            <View style={ styles.iconContainer }>
                                                <TouchableOpacity onPress={ () => (
                                                    Alert.alert(
                                                        'Remove Market Item',
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
                                                                        await FBApp.db.delete(COLLECTIONS.sale_items, item.id);

                                                                        // Show notif
                                                                        ToastAndroid.showWithGravity('Market Item Removed', ToastAndroid.LONG, ToastAndroid.TOP);

                                                                        // Reload
                                                                        router.replace('/market/StaffMarket');
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
                                                    <View style={ styles.iconBackground }>
                                                        <FontAwesome name="trash-o" size={ 18 } color="#ED5E5E" style={ styles.icon } />
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={ () => router.replace(`/market/edit/${item.id}`) }>
                                                    <View style={ styles.iconBackground }>
                                                        <MaterialIcons name="edit" size={ 18 } color="#389F4F" style={ styles.icon } />
                                                    </View>
                                                </TouchableOpacity>
                                                {
                                                    item.Quantity > 0 && <TouchableOpacity onPress={ () => (
                                                        Alert.alert(
                                                            'Mark as Sold',
                                                            'This sale item will not be for sale anymore.',
                                                            [
                                                                {
                                                                    text: 'Cancel',
                                                                    style: 'cancel',
                                                                },
                                                                {
                                                                    text: 'sold',
                                                                    onPress: async () => {
                                                                        try {
                                                                            await FBApp.db.update(COLLECTIONS.sale_items, { Quantity: 0 } ,item.id);

                                                                            // Show notif
                                                                            ToastAndroid.showWithGravity('Market Item Sold', ToastAndroid.LONG, ToastAndroid.TOP);

                                                                            // Reload
                                                                            router.replace('/market/StaffMarket');
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
                                                        <View style={ styles.iconBackground }>
                                                            <MaterialIcons name="shopping-cart" size={ 18 } color="#389F4F" style={ styles.icon } />
                                                        </View>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                            <View style={ styles.itemInfoContainer }>
                                                <Text style={ styles.marketName }>{ item.data.Item_name }</Text>
                                                <Text style={ styles.marketStock }>In Store: { item.Quantity }g</Text>
                                            </View>
                                            <Text style={ styles.marketPrice }>₱{ parseFloat(item.Price).toLocaleString(undefined, { minimumFractionDigits: 2 }) } per kg</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        </> : <Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ height: 140, width: 120, borderRadius: 10, backgroundColor: 'white', alignSelf: 'center' }} />
                    }
                </View>
                
                <TouchableOpacity style={ styles.plusButton } onPress={ () => router.replace('/market/AddSaleItem') }>
                    <View style={ styles.plusButtonInner }>
                        <AntDesign name="pluscircle" size={ 50 } color="#389F4F" />
                    </View>
                </TouchableOpacity>

                <Navigation currentRoute="Market"/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFF',
    },
    body: {
        flex: 1
    },
    contentContainer: {
        paddingHorizontal: 5,
        marginBottom: 120
    },
    marketItem: {
        flex: 1,
        alignItems: 'center',
        margin: 8,
    },
    marketItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingBottom:10,
        paddingRight: 10,
        padding: 15,
        maxHeight: 'auto',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: {
        height: 2,
        width: 0,
        },
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        position: 'absolute',
        gap: 5,
        top: 0,
        left: 0,
        right: 0,
    },
    iconBackground: {
        backgroundColor: 'white',
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#389F4F',
    },
    icon: {
        margin: 8,
    },
    marketImage: {
        width: 140,
        height: 180,
        resizeMode: 'cover',
        borderRadius: 5,
    },
    itemInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    marketName: {
        fontSize: 18,
        fontWeight: '700',
        flexShrink: 1,
        overflow: 'hidden',
        includeFontPadding: false,
        maxWidth: '60%'
    },
    marketStock: {
        paddingLeft:10,
        fontSize: 9,
        color: '#999',
    },
    marketPrice: {
        fontSize: 12,
        color: '#389F4F',
        letterSpacing: 1,
    },
    plusButton: {
        position: 'absolute',
        bottom: 0,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 70,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    plusButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFF',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default MarketScreen;