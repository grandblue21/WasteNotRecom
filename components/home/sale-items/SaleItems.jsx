import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONT, SIZES, COLLECTIONS } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import getProfile from '../../../hook/getProfile';
import getSaleItems from '../../../hook/getSaleItems';
import { useRouter } from 'expo-router';
import FirebaseApp from '../../../helpers/FirebaseApp';

const SaleItems = () => {

    const router = useRouter();
    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const { saleItems, isLoading: isLSI, refetch } = getSaleItems({ column: 'Restaurant_Id', comparison: '==', value: profile.adminId });
    const [items, setItems] = useState([]);

    // Gets ingredients if profile and sale items are loaded
    useEffect(() => {

        const getData = async () => {
            const items = await FBApp.db.gets(COLLECTIONS.ingredients, {
                column: 'ItemId',
                comparison: 'in',
                value: saleItems.map(x => x.ItemId)
            });
            
            // Include to data
            setItems(saleItems.map((item) => ({ ...item, data: items.find(x => x.ItemId, item.ItemId) })));
        }

        // Get data if both are fetched
        if (!isLoading && !isLSI) {
            getData();
        }
    }, [isLoading, isLSI, saleItems]);

    useEffect(() => {
        // Refetch if profile is loaded
        if (profile.adminId) {
            refetch();
        }
    }, [profile.adminId]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Items on Sale</Text>
                <TouchableOpacity style={styles.seeAllContainer} onPress={ () => router.replace('/market/StaffMarket') }>
                    <Text style={styles.seeAllText}>See All</Text>
                    <FontAwesome name="chevron-right" style={styles.seeAllIcon}/>
                </TouchableOpacity>
            </View>

            <View style={styles.itemContainer}>
                <FlatList
                    data={ items }
                    renderItem={({ item }) => (
                        <TouchableOpacity>
                            <Image src={ item.data.image } style={styles.item} />
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

export default SaleItems;