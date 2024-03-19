import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, ToastAndroid, Image } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { COLORS, SIZES, COLLECTIONS } from '../../../constants';
import Header from '../../../components/common/header/Header';
import FirebaseApp from '../../../helpers/FirebaseApp';
import { useRouter } from 'expo-router';
import moment from 'moment/moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { gramsToKg } from '../../../helpers/Converter';

const AddBatch = () => {

    const router = useRouter();
    const { id } = useGlobalSearchParams();
    const FBApp = new FirebaseApp();
    const [ingredient, setIngredient] = useState({});
    const [history, setHistory] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [expDate, setExpDate] = useState(new Date(moment().format('YYYY-MM-DD')));
    const [show, setShow] = useState(false);
    const onChange = (event, selectedDate) => {
        setExpDate(selectedDate);
        setShow(false);
    };
    const handleConfirm = async () => {

        try {

            // Check if ingredient is loaded
            if (!ingredient.id) {
                throw 'Loading please wait';
            }
            
            const data = {
                ItemId: ingredient.ItemId,
                item_quantity: quantity,
                Expiry_date: moment(expDate).format('YYYY-MM-DD'),
                Date_added: moment().format('YYYY-MM-DD')
            }

            // Check data
            Object.values(data).map((value) => {
                if (!value) {
                    throw 'Fill in required fields';
                }
            });

            // Insert History
            const history_result = await FBApp.db.insert(COLLECTIONS.ingredients_history, data);

            // Check if added
            if (!history_result) {
                throw 'Failed to add batch';
            }

            // Update quantity
            await FBApp.db.update(COLLECTIONS.ingredients, { total_quantity: history.reduce((total, current) => total + parseInt(current.item_quantity), parseInt(quantity)) }, ingredient.id);

            // Show notif
            ToastAndroid.showWithGravity(`New Batch of ${ ingredient.Item_name } Added`, ToastAndroid.LONG, ToastAndroid.TOP);

            // Redirect to ingredients
            router.replace('/inventory/Inventory');
        }
        catch (error) {

            // Show notif
            ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.TOP);
        }
    };

    useEffect(() => {

        const fetchData = async () => {
            setHistory(await FBApp.db.gets(COLLECTIONS.ingredients_history, {
                column: 'ItemId',
                comparison: '==',
                value: ingredient.ItemId
            }));
        }

        fetchData();
    }, [ingredient]);

    useEffect(() => {
        
        const fetchData = async () => {
            setIngredient(await FBApp.db.get_from_ref(COLLECTIONS.ingredients, id));
        }

        fetchData();
    }, []);

    return <>
        <SafeAreaView style={ styles.container }>

            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace('/inventory/Inventory') }}/>

            <View style={ styles.body }>

                <View style={ styles.imageContainer }>
                    <Image src={ ingredient.image } style={ styles.image }></Image>
                    <Text style={{ fontSize: 40, fontWeight: 'bold' }}>{ ingredient.Item_name }</Text>
                </View>

                <View style={ styles.infoContainer }>

                    <View style={{ ...styles.infoItem, justifyContent: 'flex-start' }}>
                        <Text style={ styles.infoLabel }>Grams:</Text>
                        <TextInput style={{ ...styles.infoInput, width: 127 }} value={ quantity } onChangeText={ (input) => setQuantity(input) }/>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>/{ gramsToKg(history.reduce((total, current) => total + parseInt(current.item_quantity), 0), 3) }grams</Text>
                    </View>

                    <View style={ styles.infoItem }>
                        <Text style={ styles.infoLabel }>Expiry:</Text>
                        <TextInput style={ styles.infoInput } value={ moment(expDate).format('MMMM D, YYYY') } placeholder="Expiration Date" onChangeText={ (input) => setExpDate(input) } editable={ false } />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 20 }}>
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
                    <Text style={{ marginLeft: 20 }}>Date Added: { moment().format('MMMM D, YYYY') }</Text>
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
    },
    image: {
        height: 187,
        width: 187,
        borderWidth: 1,
        borderRadius: 94
    },
    infoContainer: {
        flex: 1
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

export default AddBatch;