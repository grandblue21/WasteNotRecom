import { SafeAreaView, TouchableOpacity, View, Text, StyleSheet, Image, TextInput } from 'react-native';
import Header from '../../components/common/header/Header';
import { FONT, COLORS, SIZES } from '../../constants';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const IngredientCard = () => {

    const router = useRouter();

    const rating = 4;
    
    return (
        <SafeAreaView style={ styles.container }>

            <Header hideTitle={ true } hideNotification={ true } showBackOverride={ false }/>

            <View style={ styles.body }>

                <Image source={{ uri: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' }} style={ styles.ingredientImage }/>
                
                <View style={ styles.detailsContainer }>
                    
                    <View style={ styles.detail }>

                        <Text style={ styles.detailLabel }>Name</Text>
                        <TextInput style={ styles.detailInput }/>

                    </View>

                    <View style={ styles.detail }>

                        <Text style={ styles.detailLabel }>Price</Text>
                        <TextInput style={ styles.detailInput }/>

                    </View>

                    <View style={ styles.detail }>

                        <Text style={ styles.detailLabel }>Avail</Text>
                        <TextInput style={ styles.detailInput }/>

                    </View>

                </View>

                <View style={ styles.buttonContainer }>
                    <TouchableOpacity style={ styles.cancelButton } onPress={ () => router.back() }>
                        <Text style={ styles.buttonText }>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ styles.confirmButton }>
                        <Text style={ styles.buttonText }>TO Wishlist</Text>
                    </TouchableOpacity>
                </View>

            </View>
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    body: {
        flex: 1,
        padding: SIZES.small
    },
    ingredientImage: {
        height: 187,
        width: 187,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 93,
        marginBottom: 40
    },
    detailsContainer: {
        flex: 1
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    detailLabel: {
        fontSize: 25,
        marginRight: 10
    },
    detailInput: {
        fontSize: 20,
        fontWeight: '600',
        width: '80%',
        height: 47,
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
    cancelButton: {
        width: '50%',
        borderWidth: 1,
        height: 61,
        borderColor: '#B20000',
        marginRight: 1.5,
        borderRadius: 7,
        backgroundColor: '#ED5E5E',
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmButton: {
        width: '50%',
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


export default IngredientCard;