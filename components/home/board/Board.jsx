import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, COLLECTIONS } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import getProfile from '../../../hook/getProfile';
import getIngredients from '../../../hook/getIngredients';
import { useRouter } from 'expo-router';
import FirebaseApp from '../../../helpers/FirebaseApp';

const Board = () => {
    
    const router = useRouter();
    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const { ingredients, isLoading: isLI, refetch } = getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [ingredientsWQ, setIngredientsWQ] = useState([]);
    const [header, setHeader] = useState('');
    const [boardItems, setBoardItems] = useState([]);

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

            const need_refills = ingredientsWQ.filter(x => x.stock < 10).map(x => `${x.Item_name} needs refill`);

            // New boad items
            setBoardItems([...boardItems, ...need_refills]);

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
    }, [profile.adminId]);

    return (
        boardItems.length > 0 ? 
            <View style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.headerText}>{ header }</Text>
                    <TouchableOpacity onPress={ () => router.replace('inventory/Inventory') }>
                        <FontAwesome name={'angle-double-right'} style={styles.headerIcon}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.boardItemContainer}>
                    <FlatList
                        data={ boardItems }
                        renderItem={ ({ item }) => <Text style={styles.boardItem}>{ item }</Text> }
                        keyExtractor={(item, index) => index}
                    />
                </View>

            </View>
        : null
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: SIZES.small,
        marginBottom: 10,
        borderRadius: 15
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        color: 'white',
        fontWeight: '500'
    },
    headerIcon: {
        fontSize: 25,
        color: 'white'
    },
    boardItemContainer: {
        padding: 5
    },
    boardItem: {
        fontSize: 15,
        fontWeight: '500',
        color: 'white'
    }
});

export default Board;