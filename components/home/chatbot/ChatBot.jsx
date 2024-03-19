import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Touchable } from 'react-native';
import { COLORS, FONT, SIZES } from '../../../constants';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Chatbot = () => {

    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Chat-bot</Text>
                <TouchableOpacity style={styles.seeAllContainer} onPress={ () => router.replace('/chatbot/Chatbot') }>
                    <Text style={styles.seeAllText}>Tap to View</Text>
                    <FontAwesome name="chevron-right" style={styles.seeAllIcon}/>
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                <TouchableOpacity onPress={ () => router.replace('/chatbot/Chatbot') }>
                    <Image source={{ uri: 'https://png.pngtree.com/png-clipart/20200224/original/pngtree-message-icon-for-your-project-png-image_5214044.jpg' }} style={styles.image} />
                </TouchableOpacity>
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
    imageContainer: {
        paddingVertical: 10,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        marginBottom: 5,
        borderColor: COLORS.primary
    },
    image: {
        height: 174,
        width: 335,
        resizeMode: 'contain'
    }
});

export default Chatbot;