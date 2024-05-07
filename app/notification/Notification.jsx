import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import getProfile from '../../hook/getProfile';
import { useRouter } from 'expo-router';
import FirebaseApp from '../../helpers/FirebaseApp';
import { images, COLLECTIONS, COLORS } from '../../constants';
import getIngredients from '../../hook/getIngredients';

const Notification = () => {

    const router = useRouter();
    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const { ingredients, isLoading: isLI, refetch } = getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [ingredientsWQ, setIngredientsWQ] = useState([]);
    const [header, setHeader] = useState('');
    const [needsRefills, setNeedRefills] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

            setIngredientsWQ(await Promise.all(ingredients.map(async (ingredient) => {
                // Get History
                const history = await FBApp.db.gets(COLLECTIONS.ingredients_history, {
                    column: 'ItemId',
                    comparison: '==',
                    value: ingredient.ItemId
                });

                return { ...ingredient, stock: (history.length > 0 ? history.reduce((total, current) => total + parseInt(current.item_quantity), 0) : 0) }
            })));
        }

        /// Load ingredients if profile loaded
        if (!isLoading && !isLI) {
            fetchData();
        }
    }, [isLoading, isLI, ingredients]);

    useEffect(() => {

        const fetchData = () => {

            const need_refills = ingredientsWQ.filter(x => x.quantity_left < 10);

            // New boad items
            setNeedRefills([...needsRefills, ...need_refills]);

            // Need refills is more than 0
            if (need_refills.length > 0) {
                setHeader('Inventory Lacking');
            }
        }

        // Ingredients are fetched
        if (ingredientsWQ.length > 0) {
            fetchData();
        }
    }, [ingredientsWQ]);

    useEffect(() => {
        // Refetch if profile is loaded
        if (profile.adminId) {
            refetch();
        }
    }, [profile.adminId]);console.log(ingredientsWQ);

    return (
        needsRefills.length > 0 ? 
            <View style={styles.container}>
                <View style={styles.boardItemContainer}>
                    <FlatList
                        data={ needsRefills }
                        renderItem={ ({ item }) => (
                            <TouchableOpacity style={ styles.notifWrapper } onPress={ () => router.replace(`/ingredient/add-batch/${ item.id }`) }>
                                <View style={ styles.itemImgWrapper }>
                                    <Image src={ item.imageUrl ?? 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foppenheimerusa.com%2Fwp-content%2Fthemes%2Foppenheimer%2Fassets%2Fimages%2Fproduct-placeholder.jpg&f=1&nofb=1&ipt=66fdf705465b3aaaa8e0b1458f5450cd7d60dd360b48ed5e8679d0293ce68a01&ipo=images' } style={ styles.itemImg }/>
                                </View>
                                <Text style={ styles.notifText }>{ item.Item_name } only has { item.quantity_left } grams left, and needs to be restocked</Text>
                            </TouchableOpacity>
                        ) }
                        keyExtractor={(item, index) => index}
                    />
                </View>
            </View>
        : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ height: 200, width: '100%', borderRadius: 10, backgroundColor: 'white', alignSelf: 'center' }} /></View>
    )
}

const styles = StyleSheet.create({
    boardItemContainer: {
        paddingTop: 10
    },
    notifWrapper: {
        height: 80,
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'white'
    },
    itemImgWrapper: {
        backgroundColor: 'white',
        padding: 5,
        marginRight: 10,
        borderRadius: 25,
        overflow: 'hidden'
    },
    itemImg: {
        height: 50,
        width: 50
    },
    notifText: {
        paddingRight: 50,
        color: 'white'
    }
});

export default Notification;