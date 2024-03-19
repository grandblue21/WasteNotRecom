import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONT, SIZES, COLLECTIONS } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import getSaleItems from '../../../hook/getSaleItems';
import FirebaseApp from '../../../helpers/FirebaseApp';
import { useRouter } from 'expo-router';

const ForSale = () => {

    const router = useRouter();
    const FBApp = new FirebaseApp();
    const [items, setItems] = useState([]);
    const { saleItems } = getSaleItems();

    useEffect(() => {

        const fetchData = async () => {
            const ingredient = await FBApp.db.gets(COLLECTIONS.ingredients, {
                column: 'ItemId',
                comparison: 'in',
                value: saleItems.map(x => x.ItemId)
            });
            
            // Include to data
            setItems(saleItems.map((item) => ({ ...item, image: ingredient.find(x => x.ItemId).image })));
        }

        // Fetch items if not empty
        if (saleItems.length > 0) {
            fetchData();
        }
    }, [saleItems]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>For Sale</Text>
                <TouchableOpacity style={styles.seeAllContainer} onPress={ () => router.replace(`/market/Market`) }>
                    <Text style={styles.seeAllText}>See All</Text>
                    <FontAwesome name="chevron-right" style={styles.seeAllIcon}/>
                </TouchableOpacity>
            </View>

            <View style={styles.itemContainer}>
                <FlatList
                    data={ items }
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={ () => router.replace(`/restaurant/ingredient-cart/${ item.id }`) }>
                            <Image source={{ uri: item.image }} style={styles.item} />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index}
                    contentContainerStyle={{ columnGap: SIZES.medium }}
                    horizontal
                />
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
    itemContainer: {
        paddingVertical: 10,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        marginBottom: 5,
        borderColor: COLORS.primary
    },
    item: {
        height: 111,
        width: 102,
        borderRadius: 10,
        backgroundColor: 'white'
    }
});

export default ForSale;