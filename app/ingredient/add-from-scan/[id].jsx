import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, ToastAndroid, Image, ScrollView } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { COLORS, SIZES, COLLECTIONS, CATEGORIES } from '../../../constants';
import Header from '../../../components/common/header/Header';
import FirebaseApp from '../../../helpers/FirebaseApp';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'expo-router';
import getProfile from '../../../hook/getProfile';
import getIngredients from '../../../hook/getIngredients';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment/moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';

const Ingredient = () => {

    const router = useRouter();
    const { id } = useGlobalSearchParams();
    const [image, setImage] = useState(null);
    const [itemId, setItemId] = useState(id == 'manual_scan' ? '' : id);
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expDate, setExpDate] = useState(new Date(moment().format('YYYY-MM-DD')));
    const [price, setPrice] = useState(null);
    const [isMarketItem, setIsMarketItem] = useState(false);
    const { profile } = getProfile();
    const { ingredients, refetch } = getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState(null);
    const [items, setItems] = useState(CATEGORIES.map(x => ({ label: x, value: x })));
    const [show, setShow] = useState(false);
    const onChange = (event, selectedDate) => {
        setExpDate(selectedDate);
        setShow(false);
    };
    const handleConfirm = async () => {

        try {
            
            const data = {
                ItemId: itemId,
                Item_name: name,
                Restaurant_id: profile.adminId,
                category: category,
                image: image ?? 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foppenheimerusa.com%2Fwp-content%2Fthemes%2Foppenheimer%2Fassets%2Fimages%2Fproduct-placeholder.jpg&f=1&nofb=1&ipt=66fdf705465b3aaaa8e0b1458f5450cd7d60dd360b48ed5e8679d0293ce68a01&ipo=images',
                quantity_left: isMarketItem ? 0 : quantity,
                total_quantity: quantity
            }

            // Check data
            Object.values(data).map((value, index) => {
                if (!value && typeof value == null) {
                    throw 'Fill in required fields';
                }
            });

            // Check if number
            if (isNaN(parseFloat(quantity))) {
                throw 'Quantity entered is not a number';
            }

            // Market additional check
            if (isMarketItem && !price) {
                throw 'Price is required for Market Items';
            }

            // Check if number
            if (isMarketItem && isNaN(parseFloat(price))) {
                throw 'Price entered is not a number';
            }

            // Handle finish
            const handleFinish = async () => {

                // Check if ingredient exists
                const existing_ing = ingredients.find((x) => x.ItemId == itemId);

                // Existing
                if (existing_ing) {

                    // Update Ingredient
                    const result = await FBApp.db.update(COLLECTIONS.ingredients, { quantity_left: parseInt(existing_ing.quantity_left) + parseInt(data.quantity_left), total_quantity: parseInt(existing_ing.total_quantity) + parseInt(data.quantity_left) }, existing_ing.id);

                    // Check if added
                    if (!result) {
                        throw 'Failed to add ingredient';
                    }
                }
                else {
                    // Insert Ingredient
                    const result = await FBApp.db.insert(COLLECTIONS.ingredients, data);

                    // Check if added
                    if (!result) {
                        throw 'Failed to add ingredient';
                    }
                }

                // Insert History
                const history = await FBApp.db.insert(COLLECTIONS.ingredients_history, {
                    ItemId: id,
                    item_quantity: quantity,
                    Expiry_date: moment(expDate).format('YYYY-MM-DD'),
                    Date_added: moment().format('YYYY-MM-DD')
                });

                // Check if added
                if (!history) {
                    throw 'Failed to add ingredient';
                }

                // Include market if for sale
                if (isMarketItem) {

                    // Insert Market Request Item
                    const request = await FBApp.db.insert(COLLECTIONS.market_request, {
                        item_id: id,
                        Date: moment().format('YYYY-MM-DD'),
                        Item_name: name,
                        price: price,
                        item_quantity: quantity,
                        Staff_id: profile.id,
                        Restaurant_id: profile.adminId
                    });

                    // Check if added
                    if (!request) {
                        throw 'Failed to add ingredient';
                    }

                    // Insert Sale Item
                    const saleItem = await FBApp.db.insert(COLLECTIONS.sale_items, {
                        Date: moment().format('YYYY-MM-DD'),
                        ItemId: id,
                        Item_name: name,
                        Price: price,
                        Quantity: quantity,
                        Staff_id: profile.id,
                        Restaurant_Id: profile.adminId
                    });
                    
                    // Check if added
                    if (!saleItem) {
                        throw 'Failed to add ingredient';
                    }
                }

                // Show notif
                ToastAndroid.showWithGravity('Ingredient Added', ToastAndroid.LONG, ToastAndroid.TOP);

                // Redirect to ingredients
                router.replace('/inventory/Inventory');
            }
            
            // Set Firebase Instance
            const FBApp = new FirebaseApp();
            
            // There is image uploaded
            if (image) {

                const fetchResponse = await fetch(image);
                const file = await fetchResponse.blob();
                const storage = getStorage(FBApp.getInstance());
                const storageRef = ref(storage, 'ingredient/' + id + moment().format('_YYYY-MM-DDDD-HH-mm-ss') + '.jpg');
                const uploadTask = uploadBytesResumable(storageRef, file);

                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on('state_changed', () => {
                    // Uploading
                }, () => {
                    // Error
                    throw 'Failed to upload image';
                }, async () => {
                    // Done
                    await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        data.image = downloadURL; handleFinish();
                    });
                });
            }
            else {
                handleFinish();
            }
        }
        catch (error) {

            // Show notif
            ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.TOP);
        }
    };
    const handleImagePress = async () => {

        // Upload image
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
    
        // Check if cancelled
        if (result.canceled) {
            return;
        }

        setImage(result.assets[0].uri);
    }

    useEffect(() => {
        // Refetch if profile is loaded
        if (profile.adminId) {
            refetch();
        }
    }, [profile.adminId]);

    return <>
        <SafeAreaView style={ styles.container }>

            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace('/inventory/Inventory') }}/>

            <View style={ styles.body }>

                <ScrollView style={{ flex: 1 }}>

                    <TouchableOpacity onPress={ handleImagePress } style={ styles.imageContainer }>
                        <Image src={ image ?? 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foppenheimerusa.com%2Fwp-content%2Fthemes%2Foppenheimer%2Fassets%2Fimages%2Fproduct-placeholder.jpg&f=1&nofb=1&ipt=66fdf705465b3aaaa8e0b1458f5450cd7d60dd360b48ed5e8679d0293ce68a01&ipo=images' } style={ styles.image }></Image>
                    </TouchableOpacity>

                    <View style={ styles.infoContainer }>

                        <View style={ styles.infoItem }>
                            <Text style={ styles.infoLabel }>ID:</Text>
                            <TextInput style={ styles.infoInput } value={ itemId } editable={ id == 'manual_scan' } onChangeText={ (input) => setItemId(input) }/>
                        </View>

                        <View style={ styles.infoItem }>
                            <Text style={ { ...styles.infoLabel, width: '40%'} }>Category:</Text>
                            <DropDownPicker
                                open={ open }
                                value={ category }
                                items={ items }
                                setOpen={ setOpen }
                                setValue={ setCategory }
                                setItems={ setItems }
                                placeholder="Select Category"
                                style={ styles.infoInput }
                            />
                        </View>

                        <View style={ styles.infoItem }>
                            <Text style={ styles.infoLabel }>Name:</Text>
                            <TextInput style={ styles.infoInput } value={ name } placeholder="Name" onChangeText={ (input) => setName(input) }/>
                        </View>

                        <View style={ styles.infoItem }>
                            <Text style={ styles.infoLabel }>Quantity:</Text>
                            <TextInput style={ styles.infoInput } value={ quantity } placeholder="0 grams" onChangeText={ (input) => setQuantity(input) }/>
                        </View>

                        {
                            isMarketItem && 
                            <View style={ styles.infoItem }>
                                <Text style={ styles.infoLabel }>Price:</Text>
                                <TextInput style={ styles.infoInput } value={ price } placeholder="₱0.00" onChangeText={ (input) => setPrice(input) }/>
                            </View>
                        }

                        <View style={ styles.infoItem }>
                            <Text style={ styles.infoLabel }>Expiry:</Text>
                            <TextInput style={ styles.infoInput } value={ moment(expDate).format('MMMM D, YYYY') } placeholder="Expiration Date" onChangeText={ (input) => setExpDate(input) } editable={ false} />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 20, marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                                <Checkbox style={styles.checkbox} value={ isMarketItem } onValueChange={ setIsMarketItem }/>
                                <Text style={{ paddingLeft: 5 }}>Is for sale</Text>
                            </View>
                            <TouchableOpacity onPress={ () => setShow(true) }>
                                <Text>Show Calendar</Text>
                                {(
                                    show && <DateTimePicker
                                        value={ expDate }
                                        mode="date"
                                        minimumDate={ moment().toDate() }
                                        onChange={ onChange }
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={ styles.buttonContainer }>
                        <TouchableOpacity style={ styles.confirmButton } onPress={ handleConfirm }>
                            <Text style={ styles.buttonText }>Confirm</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

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
        borderRadius: 94,
        borderColor: COLORS.primary
    },
    infoContainer: {
        flex: 1,
        marginBottom: 30
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

export default Ingredient;