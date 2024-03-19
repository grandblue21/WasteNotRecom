import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONT, SIZES } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import getMenu from '../../../hook/getMenu';
import getProfile from '../../../hook/getProfile';
import { useRouter } from 'expo-router';

const TopDishes = () => {

    const router = useRouter();
    const { profile } = getProfile();
    const { menu, isLoading: isLM, refetch } = getMenu({ column: 'userId', comparison: '==', value: profile.adminId});
    const [menuList, setMenuList] = useState([]);

    useEffect(() => {
        
        const fetchData = () => {
            setMenuList(menu)
        }

        // Get menu if profile is loaded
        if (!profile.isLoading && !menu.isLoading) {
            fetchData();
        }

    }, [profile, menu]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Top Dishes</Text>
                <TouchableOpacity style={styles.seeAllContainer} onPress={ () => router.replace('/menu/Menu') }>
                    <Text style={styles.seeAllText}>See All</Text>
                    <FontAwesome name="chevron-right" style={styles.seeAllIcon}/>
                </TouchableOpacity>
            </View>

            <View style={styles.dishContainer}>
                <FlatList
                    data={ menuList }
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={ () => router.replace(`/menu/menu-dish/${ item.id }`) }>
                            <Image src={ item.imageUrl ?? 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F512%2F282%2F282465.png&f=1&nofb=1&ipt=882638a8b113a96b2f827e92de88e9728c11378025d1842bb22cea7e21f37d9c&ipo=images' } style={styles.dish} />
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
    dishContainer: {
        paddingVertical: 10,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        marginBottom: 5,
        borderColor: COLORS.primary
    },
    dish: {
        height: 111,
        width: 102,
        borderRadius: 10,
        backgroundColor: 'white'
    }
});

export default TopDishes;