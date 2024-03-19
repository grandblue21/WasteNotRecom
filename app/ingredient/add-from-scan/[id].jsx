import { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, ToastAndroid, Image, ScrollView } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { COLORS, SIZES, COLLECTIONS, CATEGORIES, INGREDIENT_CLASSIFICATIONS } from '../../../constants';
import Header from '../../../components/common/header/Header';
import FirebaseApp from '../../../helpers/FirebaseApp';
import { useRouter } from 'expo-router';
import getProfile from '../../../hook/getProfile';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment/moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';

const Ingredient = () => {

    const router = useRouter();
    const { id } = useGlobalSearchParams();
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expDate, setExpDate] = useState(new Date(moment().format('YYYY-MM-DD')));
    const [price, setPrice] = useState(null);
    const [isMarketItem, setIsMarketItem] = useState(false);
    const [classifications, setClassifications] = useState(INGREDIENT_CLASSIFICATIONS.map((x) => ({ name: x.name, checked: false })));
    const { profile } = getProfile();
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
                ItemId: id,
                Item_name: name,
                Restaurant_id: profile.adminId,
                category: category,
                image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foppenheimerusa.com%2Fwp-content%2Fthemes%2Foppenheimer%2Fassets%2Fimages%2Fproduct-placeholder.jpg&f=1&nofb=1&ipt=66fdf705465b3aaaa8e0b1458f5450cd7d60dd360b48ed5e8679d0293ce68a01&ipo=images',
                quantity_left: isMarketItem ? 0 : quantity,
                total_quantity: quantity,
                classifications: classifications.filter(x => x.checked).map(x => x.name)
            }

            // Check classification
            if (classifications.filter(x => x.checked).length == 0) {
                throw 'Specify atleast one ingredient classification';
            }

            // Check data
            Object.values(data).map((value) => {
                if (!value) {
                    throw 'Fill in required fields';
                }
            });

            // Market additional check
            if (isMarketItem && !price) {
                throw 'Price is required for Market Items';
            }
            
            // Set Firebase Instance
            const FBApp = new FirebaseApp();
            
            // Insert Ingredient
            const result = await FBApp.db.insert(COLLECTIONS.ingredients, data);

            // Check if added
            if (!result) {
                throw 'Failed to add ingredient';
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
                    Item_name: ingredient.Item_name,
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
                    Item_name: ingredient.Item_name,
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
        catch (error) {

            // Show notif
            ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.TOP);
        }
    };

    return <>
        <SafeAreaView style={ styles.container }>

            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace('/inventory/Inventory') }}/>

            <View style={ styles.body }>

                <ScrollView style={{ flex: 1 }}>

                    <View style={ styles.imageContainer }>
                        <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foppenheimerusa.com%2Fwp-content%2Fthemes%2Foppenheimer%2Fassets%2Fimages%2Fproduct-placeholder.jpg&f=1&nofb=1&ipt=66fdf705465b3aaaa8e0b1458f5450cd7d60dd360b48ed5e8679d0293ce68a01&ipo=images" style={ styles.image }></Image>
                    </View>

                    <View style={ styles.infoContainer }>

                        <View style={ styles.infoItem }>
                            <Text style={ styles.infoLabel }>ID:</Text>
                            <TextInput style={ styles.infoInput } value={ id } editable={ false }/>
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

                        <View style={{ marginLeft: 20 }}>
                            <Text style={{ ...styles.infoLabel, width: '100%', textAlign: 'left', marginBottom: 10 }}>Classification</Text>
                            {
                                INGREDIENT_CLASSIFICATIONS.map((classification, index) => (
                                    <View style={{ flexDirection: 'row', paddingLeft: 20, marginBottom: 10 }}>
                                        <Checkbox style={styles.checkbox} value={ classifications[index].checked } onValueChange={ (isChecked) => {

                                            setClassifications(classifications.map((x, i) => {

                                                // Check if current
                                                if (index == i) {
                                                    x.checked = isChecked;
                                                }

                                                return x;
                                            }));

                                        } }/>
                                        <Text style={{ paddingLeft: 5 }}>{ classification.name }</Text>
                                    </View>
                                ))
                            }
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
        borderRadius: 94
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