import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, ToastAndroid, Image } from 'react-native';
import { COLORS, SIZES, COLLECTIONS } from '../../../constants'
import Header from '../../../components/common/header/Header';
import FirebaseApp from '../../../helpers/FirebaseApp';
import { useRouter } from 'expo-router';
import getProfile from '../../../hook/getProfile';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment/moment';
import getIngredients from '../../../hook/getIngredients';
import { useGlobalSearchParams } from 'expo-router';

const EditSaleItem = () => {

    const router = useRouter();
    const { id } = useGlobalSearchParams();
    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const { ingredients, refetch } = getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [saleItem, setSaleItem] = useState({});
    const [ingredientList, setIngredientList] = useState([]);
    const [item, setItem] = useState(null);
    const [price, setPrice] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [open, setOpen] = useState(false);
    const [ingredient, setIngredient] = useState({});
    const [itemImage, setItemImage] = useState('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foppenheimerusa.com%2Fwp-content%2Fthemes%2Foppenheimer%2Fassets%2Fimages%2Fproduct-placeholder.jpg&f=1&nofb=1&ipt=66fdf705465b3aaaa8e0b1458f5450cd7d60dd360b48ed5e8679d0293ce68a01&ipo=images');
    const handleItemChange = (selectedItem) => {

        // Find item
        const selected = ingredients.find(x => x.ItemId == selectedItem);

        // Check if there is match
        if (!selected) {
            return true;
        }

        // Change image
        setIngredient(selected);
    };
    const handleConfirm = async () => {

        try {
            
            const data = {
                ItemId: item,
                Date: moment().format('YYYY-MM-DD'),
                Price: price,
                Quantity: quantity,
                Staff_id: profile.id,
                Restaurant_Id: profile.adminId
            }

            // Check data
            Object.values(data).map((value) => {
                if (!value) {
                    throw 'Fill in required fields';
                }
            });

            // Check if number
            if (isNaN(parseFloat(quantity))) {
                throw 'Quantity entered is not a number';
            }

            // Check if number
            if (isNaN(parseFloat(price))) {
                throw 'Price entered is not a number';
            }

            // Check if not more than quantity
            if (parseInt(quantity) > parseInt(ingredient.quantity_left) + parseInt(saleItem.Quantity)) {
                throw 'Sale quantity is more than what is left';
            }

            // Update market item
            const result = await FBApp.db.update(COLLECTIONS.sale_items, data, id);

            // Check if updated
            if (!result) {
                throw 'Failed to update market item';
            }

            // Update ingredient left
            await FBApp.db.update(COLLECTIONS.ingredients, { quantity_left: (parseInt(ingredient.quantity_left) + parseInt(saleItem.Quantity)) - parseInt(quantity) }, ingredient.id);

            // Show notif
            ToastAndroid.showWithGravity('Ingredient for Market Sale Item Updated', ToastAndroid.LONG, ToastAndroid.TOP);

            // Redirect to market
            router.replace('/market/StaffMarket');
        }
        catch (error) {

            // Show notif
            ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.TOP);
        }
    };

    useEffect(() => {

        const fetchData = async () => {
            setSaleItem(await FBApp.db.get_from_ref(COLLECTIONS.sale_items, id));
        }

        fetchData();
    }, []);

    useEffect(() => {

        const fetchData = async () => {
            setPrice(saleItem.Price.toString());
            setQuantity(saleItem.Quantity.toString());
            setItem(saleItem.ItemId);
        }

        if (saleItem.id) {
            fetchData();
        }
    }, [saleItem]);

    useEffect(() => {
        setIngredientList(ingredients.map(x => ({ label: x.Item_name, value: x.ItemId })));
        handleItemChange(id);
    }, [ingredients]);

    useEffect(() => {
        if (!isLoading) {
            refetch();
        }
    }, [isLoading]);

    return <>
        <SafeAreaView style={ styles.container }>

            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace('/market/StaffMarket') }}/>

            <View style={ styles.body }>

                <View style={ styles.imageContainer }>
                    <Image src={ itemImage } style={ styles.image }></Image>
                </View>

                <View style={ styles.infoContainer }>

                    <View style={ styles.infoItem }>
                        <Text style={ { ...styles.infoLabel, width: '40%'} }>Ingredient:</Text>
                        <DropDownPicker
                            disabled={ true }
                            open={ open }
                            value={ item }
                            items={ ingredientList }
                            setOpen={ setOpen }
                            setValue={ setItem }
                            setItems={ setIngredientList }
                            onChangeValue={ handleItemChange }
                            placeholder="Select Ingredient"
                            style={ styles.infoInput }
                        />
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Price:</Text>
                        <TextInput style={ styles.infoInput } value={ price } placeholder="₱0.00" onChangeText={ (input) => setPrice(input) }/>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Quantity:</Text>
                        <TextInput style={{ ...styles.infoInput, width: '50%' }} value={ quantity } placeholder="0 grams" onChangeText={ (input) => setQuantity(input) }/>
                        <Text style={{ fontSize: 30 }}>/{ ingredient.quantity_left ? parseInt(ingredient.quantity_left) + parseInt(saleItem.Quantity) : 0 }g left</Text>
                    </View>
                </View>

                <View style={ styles.buttonContainer }>
                    <TouchableOpacity style={ styles.confirmButton } onPress={ handleConfirm }>
                        <Text style={ styles.buttonText }>Confirm</Text>
                    </TouchableOpacity>
                </View>

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
        marginBottom: 40
    },
    image: {
        height: 187,
        width: 187,
        borderWidth: 1,
        borderRadius: 94
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
    }
});

export default EditSaleItem;