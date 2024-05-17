import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { images, COLORS, FONT, SIZES } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import getProfile from '../../../hook/getProfile';
import getIngredients from '../../../hook/getIngredients';
import { useRouter } from 'expo-router';

const Inventory = () => {

    const router = useRouter();
    const { profile, isLoading } = getProfile();
    const { ingredients, refetch } = getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });

    useEffect(() => {

        // Refetch if profile is loaded
        if (profile.adminId) {
            refetch();
        }
    }, [profile]);

    return (
        <>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Inventory</Text>
                <TouchableOpacity style={styles.seeAllContainer} onPress={ () => router.replace('/inventory/Inventory') }>
                    <Text style={styles.seeAllText}>See All</Text>
                    <FontAwesome name="chevron-right" style={styles.seeAllIcon}/>
                </TouchableOpacity>
            </View>

            <View style={styles.inventoryContainer}>
                {
                    ingredients.length > 0 ? <FlatList
                        data={ ingredients }
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={ () => router.replace(`/ingredient/history/${item.id}`) }>
                                <Image src={ item.image } style={styles.inventory} />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index}
                        contentContainerStyle={{ columnGap: SIZES.medium }}
                        horizontal
                    /> : <Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ ...styles.inventory, alignSelf: 'center' }} />
                }
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    inventoryContainer: {
        paddingVertical: 10,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        marginBottom: 5,
        borderColor: COLORS.primary
    },
    inventory: {
        height: 111,
        width: 102,
        borderRadius: 10,
        backgroundColor: 'white'
    }
});

export default Inventory;