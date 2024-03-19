import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { COLORS, SIZES, COLLECTIONS } from '../../../constants';
import Header from '../../../components/common/header/Header';
import FirebaseApp from '../../../helpers/FirebaseApp';
import { useRouter } from 'expo-router';
import getProfile from '../../../hook/getProfile';

const MenuDish = () => {

    const router = useRouter();
    const { id } = useGlobalSearchParams();
    const FBApp = new FirebaseApp();
    const { profile } = getProfile();
    const [menu, setMenu] = useState({});

    // Get menu
    const get_menu = async () => {
        setMenu(await FBApp.db.get_from_ref(COLLECTIONS.menu, id));
    }

    // Handle Cook
    const handleCook = async () => {

        try {

            // Get matching ingredients
            const matches = await FBApp.db.gets(COLLECTIONS.ingredients, { comparison: 'in', column: 'Item_name', value: menu.ingredientsList.map(i => i.ingredients) });

            // Ingredients in store
            const in_stock = matches.filter(x => x.Restaurant_id == profile.adminId);

            // Check if there is in stock
            if (in_stock.length == 0) {
                throw 'Lacking ingredients to cook menu';
            }

            // Ingredients
            const ingredients = await FBApp.db.gets(COLLECTIONS.ingredients, {
                column: 'ItemId',
                comparison: 'in',
                value: in_stock.map(x => x.ItemId)
            });

            // Iterate
            ingredients.map((ingredient) => {
                const match = menu.ingredientsList.find(x => x.ingredients == ingredient.Item_name);

                // Check if ther eis enough
                if (!ingredient.total_quantity || parseFloat(ingredient.total_quantity) < parseFloat(match.grams)) {
                    throw `Stock for ${ ingredient.Item_name } is not enough`;
                }
            });

            // Update minus the quantity
            ingredients.map(async (ingredient) => {
                const match = menu.ingredientsList.find(x => x.ingredients == ingredient.Item_name);

                // Update
                await FBApp.db.update(COLLECTIONS.ingredients, { total_quantity: parseFloat(ingredient.total_quantity) - parseFloat(match.grams) }, ingredient.id);
            });

            // Show message
            ToastAndroid.showWithGravity('Menu has been cooked!', ToastAndroid.LONG, ToastAndroid.TOP);
            
            // Reroute to menu
            router.replace('/menu/Menu');
        }
        catch (error) {

            // Show error
            ToastAndroid.showWithGravity(typeof error == 'string' ? error : 'Oops, please try again later.', ToastAndroid.LONG, ToastAndroid.TOP);

            return false;
        }
    }

    get_menu();

    return <>
        <SafeAreaView style={ styles.container }>

            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace('/menu/Menu') }}/>

            <View style={ styles.body }>

                <View style={ styles.imageContainer }>
                    <Image src={ menu.imageUrl ?? 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F512%2F282%2F282465.png&f=1&nofb=1&ipt=882638a8b113a96b2f827e92de88e9728c11378025d1842bb22cea7e21f37d9c&ipo=images' } style={ styles.image }></Image>
                    <Text style={{ fontSize: 40, fontWeight: 'bold' }}>{ menu.dishName }</Text>
                </View>

                <View style={ styles.infoContainer }>
                    {
                        menu.ingredientsList && menu.ingredientsList.length > 0 ? (menu.ingredientsList.map((i, index) => (
                            i.ingredients && i.grams && <Text key={ index } style={ styles.ingredientName }>- { `${  i.ingredients } (${ i.grams }g)` }</Text>
                        ))) : (
                            <Text style={ styles.ingredientName }>No ingredients listed</Text>
                        )
                    }
                </View>

                {
                    menu.ingredientsList && <View style={ styles.buttonContainer }>
                        <TouchableOpacity style={ styles.confirmButton } onPress={ handleCook }>
                            <Text style={ styles.buttonText }>Cook</Text>
                        </TouchableOpacity>
                    </View>
                }

            </View>

        </SafeAreaView>
    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: SIZES.small,
        backgroundColor: '#FFF'
    },
    body: {
        flex: 1
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        height: 187,
        width: 187,
        borderWidth: 1,
        borderRadius: 94
    },
    infoContainer: {
        flex: 1,
        paddingHorizontal: 30
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        marginRight: 20
    },
    infoLabel: {
        textAlign: 'right',
        textDecorationLine: 'underline',
        fontSize: 15,
        width: '20%',
        marginRight: 10
    },
    infoInput: {
        fontSize: 20,
        fontWeight: '600',
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 30,
        paddingHorizontal: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        marginHorizontal: 2,
        marginBottom: 30
    },
    confirmButton: {
        flexGrow: 1,
        borderWidth: 1,
        height: 61,
        borderColor: '#FFF',
        marginRight: 1.5,
        borderRadius: 7,
        backgroundColor: '#48B560',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 25,
        color: 'white',
        fontWeight: '500'
    },
    ingredientName: {
        fontSize: 25
    }
});

export default MenuDish;