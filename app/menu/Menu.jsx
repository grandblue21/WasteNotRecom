import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import Categories from '../../components/common/navigation/Categories';
import Header from '../../components/common/header/Header';
import { useRouter } from 'expo-router';
import Search from '../../components/home/search/Search';
import Navigation from '../../components/common/navigation/Navigation';
import getProfile from '../../hook/getProfile';
import getMenu from '../../hook/getMenu';
import { images, MENU_CATEGORIES, SIZES } from '../../constants';
import { AntDesign } from '@expo/vector-icons';

const Menu = () => {

    const router = useRouter();
    const { profile } = getProfile();
    const { menu, isLoading: isLM, refetch } = getMenu({ column: 'userId', comparison: '==', value: profile.adminId});
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [menuList, setMenuList] = useState(menu);
    const handleCategoryChange = (index, category) => {
        setSelectedCategory(category);
        setMenuList(menu.filter((x) => (
            (category != 'All' && x.category == category) || category == 'All'
        )));
    };

    useEffect(() => {
        
        const fetchData = () => {
            refetch();
        }

        // Check if both are fetched
        if (!profile.isLoading) {
            fetchData();
        }
    }, [profile]);

    useEffect(() => {
        
        const fetchData = () => {
            setMenuList(menu);
        }

        // Check if both are fetched
        if (!isLM) {
            fetchData();
        }
    }, [isLM]);
  
    return (
        <SafeAreaView style={ styles.container }>
            <Header title="Menu"/>
            <Search/>
            <View style={ styles.body }>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={ styles.txtHeader }>All is prepared</Text>
                    <TouchableOpacity onPress={ () => router.replace('/menu/Recommendation') } style={{ marginRight: SIZES.medium }}>
                        <AntDesign name="pluscircle" size={ 36 } color="#389F4F" />
                    </TouchableOpacity>
                </View>
                <View style={ styles.contentContainer }>
                    {
                        menuList.length > 0 ? <>
                            <Categories categories={ ['All', ...MENU_CATEGORIES] } onCategoryChange={ handleCategoryChange } />
                            <FlatList
                                showsVerticalScrollIndicator={ false }
                                data={ menuList } 
                                keyExtractor={ (item, index) => index }
                                numColumns={ 2 }
                                renderItem={ ({ item }) => (
                                    <TouchableOpacity style={ styles.menuItem } onPress={ () => router.replace(`/menu/menu-dish/${ item.id }`) }>
                                        <View style={ styles.menuItemContainer }>
                                            <Image src={ item.imageUrl ?? 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F512%2F282%2F282465.png&f=1&nofb=1&ipt=882638a8b113a96b2f827e92de88e9728c11378025d1842bb22cea7e21f37d9c&ipo=images' } style={ styles.menuImage } />
                                            <Text style={ styles.menuName } numberOfLines={1}>{ item.dishName }</Text>
                                            <Text style={ styles.menuPrice }>₱{ (item.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }</Text>
                                        </View>
                                    </TouchableOpacity>
                                ) }
                            />
                        </> : <Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ ...styles.menuImage, alignSelf: 'center' }} />
                    }
                </View>
            </View>

            <Navigation currentRoute="Menu"/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFF'
    },
    body: {
        flex: 1
    },
    txtHeader: {
        fontSize: 28,
        paddingStart: '4%',
        paddingTop: '3%',
        paddingBottom: '2%',
        fontWeight: '600',
        color: '#389F4F',
        letterSpacing: 2
    },
    contentContainer: {
        paddingHorizontal: 5,
        marginBottom: 180
    },
    menuItem: {
        flex: 1,
        alignItems: 'center',
        margin: 8
    },
    menuItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: {
            height: 2,
            width: 0
        }
    },
    menuImage: {
        width: 150,
        height: 180,
        resizeMode: 'cover',
        borderRadius: 5
    },
    menuName: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
        paddingStart: "5%"
    },
    menuPrice: {
        fontSize: 12,
        color: '#389F4F',
        letterSpacing: 1,
        paddingStart: "8%",
        fontWeight: "600"
    },
    plusButton: {
        position: 'absolute',
        bottom: 0,
        right: 20,
        width: 60,
        height: 60,
        marginBottom: 70,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5
    },
    plusButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFF',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default Menu;