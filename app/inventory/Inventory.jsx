import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import Header from '../../components/common/header/Header';
import { AntDesign } from '@expo/vector-icons';
import Search from '../../components/home/search/Search';
import { useRouter } from 'expo-router';
import Categories from '../../components/common/navigation/Categories';
import Navigation from '../../components/common/navigation/Navigation';
import getIngredients from '../../hook/getIngredients';
import getProfile from '../../hook/getProfile';
import { CATEGORIES, COLLECTIONS } from '../../constants';
import FirebaseApp from '../../helpers/FirebaseApp';
import { gramsToKg } from '../../helpers/Converter';
import { FontAwesome } from '@expo/vector-icons';

const Inventory = () => {

    const router = useRouter();
    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const [selectedCategory, setSelectedCategory] = useState(0);
    const { ingredients, isLoading: isLI, refetch } = getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [inventoryItems, setInventoryItems] = useState([]);
    const [inItemWStock, setInItemWStock] = useState([]);

    const handleCategoryChange = (index, category) => {
        setSelectedCategory(index);
        setInventoryItems(inItemWStock.filter((x) => (
            (category != 'All' && x.category == category) || category == 'All'
        )));
    };

    useEffect(() => {

        const fetchData = async () => {
            const with_stock = await Promise.all(ingredients.map(async (ingredient) => {
                // Get History
                const history = await FBApp.db.gets(COLLECTIONS.ingredients_history, {
                    column: 'ItemId',
                    comparison: '==',
                    value: ingredient.ItemId
                });

                return { ...ingredient, stock: (history.length > 0 ? history.reduce((total, current) => total + parseInt(current.item_quantity), 0) : 0) }
            }));
            setInventoryItems(with_stock);
            setInItemWStock(with_stock);
        }

        // Check if both profile and ingredients data have been loaded
        if (!isLoading && !isLI) {
            fetchData();
        }
    }, [isLoading, isLI, ingredients]);
    
    useEffect(() => {
        // Refetch if profile is loaded
        if (profile.adminId) {
            refetch();
        }
    }, [profile.adminId]);

    return (
        <View style={ styles.container }>
            <Header title="Inventory"/>
            <Search/>
            <View style={ styles.body }>
                <Text style={ styles.txtHeader }>Everything you need</Text>
                <View style={ styles.contentContainer }>
                    {
                        inventoryItems.length > 0 ? <>
                            <Categories categories={ ['All', ...CATEGORIES] } onCategoryChange={ handleCategoryChange } />
                            <View style={ styles.headerLabelContainer }>
                                <Text style={ styles.headerLabel }>Status</Text>
                                <Text style={ styles.headerLabel }>Product Name</Text>
                                <Text style={ styles.headerLabel }>In Stock (kg)</Text>
                            </View>

                            <FlatList
                                data={ inventoryItems } 
                                keyExtractor={ (item, index) => index }
                                showsVerticalScrollIndicator={ false }
                                renderItem={ ({ item }) => (
                                    <View style={ styles.itemContainer }>
                                        {/* Background Container */}
                                        <View style={ styles.backgroundContainer }>
                                            {/* Status Indicator */}
                                            <View
                                                style={ [
                                                    styles.statusIndicator,
                                                    { backgroundColor: (item.quantity_left / item.total_quantity) * 100 >= 10 ? 'green' : (item.stock > 0 ? 'yellow' : 'red') },
                                                ] }
                                            />
                                            {/* Item Name and Picture */}
                                            <View style={ styles.itemInfoContainer }>
                                                <Image source={{ uri: item.image }} style={ styles.itemImage } />
                                                <View style={ styles.itemDetails }>
                                                    <Text style={ styles.itemName }>{ item.Item_name }</Text>
                                                </View>
                                            </View>
                                            {/* In Stock Label with kilograms */}
                                            <Text style={ styles.inStockLabel }>{ gramsToKg(item.quantity_left ?? 0, 1) } kg </Text>
                                            <TouchableOpacity style={ { paddingLeft: 10 } } onPress={ () => router.replace(`/market/add-saleitem/${item.ItemId}`) }>
                                                <FontAwesome name="cart-plus" size={ 20 } color="#389F4F" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={ { paddingLeft: 10 } } onPress={ () => router.replace(`/ingredient/history/${item.id}`) }>
                                                <AntDesign name="doubleright" size={ 20 } color="#389F4F" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            />
                        </> : <Image src={ 'https://cdn.dribbble.com/users/634336/screenshots/2246883/_____.png' } style={{ height: 111, width: 102, borderRadius: 10, backgroundColor: 'white', alignSelf: 'center' }} />
                    }
                </View>
                <TouchableOpacity style={ styles.plusButton } onPress={ () => router.replace('/ingredient/AddIngredient') }>
                    <View style={ styles.plusButtonInner }>
                        <AntDesign name="pluscircle" size={ 50 } color="#389F4F" />
                    </View>
                </TouchableOpacity>
                <Navigation currentRoute="Inventory"/>
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
        flex: 1,
    },
    txtHeader: {
        fontSize: 28,
        paddingLeft: 16,
        paddingTop: 16,
        paddingBottom: 2,
        fontWeight: '600',
        color: '#389F4F',
        letterSpacing: 2,
    },
    contentContainer: {
        paddingHorizontal: 24,
        marginBottom: 180
    },
    headerLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerLabel: {
        fontSize: 16,
    },
    itemContainer: {
        marginBottom: 10,
    },
    backgroundContainer: {
        backgroundColor: '#D9D9D9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 25,
        minHeight:80,
        shadowColor: '#5A5353',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
        height: 2,
        width: 1.4,
        },
    },

    statusIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: '8%', // Add some space to the right of the status indicator
    },
    itemInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Expand to take available space
    },
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 24, // Add some space to the right of the item image
    },
    itemDetails: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
    },
    inStockLabel: {
        fontSize: 16,
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
    },
});

export default Inventory;