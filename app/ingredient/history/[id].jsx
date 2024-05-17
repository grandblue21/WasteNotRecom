import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, Image, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import Header from '../../../components/common/header/Header';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { COLLECTIONS, COLORS } from '../../../constants';
import moment from 'moment/moment';
import FirebaseApp from '../../../helpers/FirebaseApp';
import { gramsToKg } from '../../../helpers/Converter';

const History = () => {

    const router = useRouter();
    const [ingredient, setIngredient] = useState({});
    const [history, setHistory] = useState([]);
    const FBApp = new FirebaseApp();
    const { id } = useGlobalSearchParams();

    useEffect(() => {

        const fetchData = async () => {
            setIngredient(await FBApp.db.get_from_ref(COLLECTIONS.ingredients, id));
        }

        fetchData();
    }, []);

    useEffect(() => {

        const fetchData = async () => {
            setHistory(await FBApp.db.gets(COLLECTIONS.ingredients_history, {
                column: 'ItemId',
                comparison: '==',
                value: ingredient.ItemId
            }));
        }

        // Fetch if there is Item
        if (ingredient.ItemId) {
            fetchData();
        }
    }, [ingredient]);

    return (
        <SafeAreaView style={ styles.container }>
            <Header hideTitle={ true } hideNotification={ true } showBack={{ show: true, handleBack: () => router.replace('/inventory/Inventory') }}/>
            <View style={ styles.body }>

                <View style={ styles.imageContainer }>
                    <Image src={ ingredient.image } style={ styles.image }/>
                </View>
                <Text style={ styles.ingredientName }>{ ingredient.Item_name }</Text>
                <View style={ styles.historyContainer }>
                    <View style={ styles.historyHeaderContainer }>
                        <Text style={ styles.historyLabel }>History</Text>
                        <TouchableOpacity style={ styles.plusButton } onPress={ () => router.replace(`/ingredient/add-batch/${id}`) }>
                            <View style={ styles.plusButtonInner }>
                                <AntDesign name="pluscircle" size={ 40 } color="#389F4F" />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={ styles.history }>
                        {
                            history.map((x, index) => (
                                <View key={ index } style={ styles.historyItem }>
                                    <View style={ styles.stockTextContainer }>
                                        <Text style={ styles.stockText }>{ gramsToKg(x.item_quantity, 1) }kg</Text>
                                    </View>
                                    <View style={ styles.details }>
                                        <Text style={ styles.detailText }>Date Added { moment(x.Date_added).format('MMMM D, YYYY') }</Text>
                                        <Text style={ styles.detailText }>Expiration Date: { moment(x.Expiry_date).format('MMMM D, YYYY') }</Text>
                                    </View>
                                    <View style={ styles.action }>
                                        <TouchableOpacity onPress={ () => router.replace(`/ingredient/edit-batch/${x.id}`) }>
                                            <FontAwesome name="pencil" style={ styles.editAction } />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={ () => (
                                            Alert.alert(
                                                'Remove batch',
                                                'Are you sure you want to perform this action?',
                                                [
                                                    {
                                                        text: 'Cancel',
                                                        style: 'cancel',
                                                    },
                                                    {
                                                        text: 'Remove',
                                                        onPress: async () => {
                                                            try {
                                                                await FBApp.db.delete(COLLECTIONS.ingredients_history, x.id);

                                                                // Update quantity
                                                                await FBApp.db.update(COLLECTIONS.ingredients, { quantity_left: parseInt(ingredient.quantity_left) - parseInt(x.item_quantity), total_quantity: history.filter(y => y.id != id).reduce((total, current) => total + parseInt(current.item_quantity), 0) }, ingredient.id);

                                                                // Remove from history
                                                                setHistory(history.filter(y => y.id != x.id));

                                                                // Show notif
                                                                ToastAndroid.showWithGravity('Batch Removed', ToastAndroid.LONG, ToastAndroid.TOP);
                                                            }
                                                            catch (error) {
                                                                console.log(error);
                                                            }
                                                        }
                                                    }
                                                ],
                                                { cancelable: false }
                                            )
                                        )}>
                                            <FontAwesome name="trash" style={ styles.deleteAction } />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        }
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFF',
    },
    body: {
        flex: 1
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 15
    },
    image: {
        height: 187,
        width: 187,
        borderRadius: 93,
    },
    ingredientName: {
        fontSize: 30,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    historyContainer: {
        marginHorizontal: 5,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.primary
    },
    historyHeaderContainer: {
        marginBottom: 5,
        paddingHorizontal: 10,
        justifyContent: 'space-between'
    },
    historyLabel: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    plusButton: {
        position: 'absolute',
        bottom: 0,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    plusButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: '#FFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyItem: {
        borderTopWidth: 3,
        borderColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    stockText: {
        fontSize: 30,
        fontWeight: 'bold'
    },
    details: {
        justfiyContent: 'center',
        alignItems: 'center'
    },
    detailText: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    action: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    editAction: {
        fontSize: 24,
        color: COLORS.primary,
        marginRight: 15
    },
    deleteAction: {
        fontSize: 24,
        color: 'red'
    }
});

export default History;