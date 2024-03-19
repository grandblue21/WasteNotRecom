import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SIZES } from '../../constants';
import Search from '../../components/home/search/Search';
import Restaurants from '../../components/home/restaurants/Restaurants';
import ForSale from '../../components/home/for-sale/ForSale';
import Chatbot from '../../components/home/chatbot/ChatBot';
import Navigation from '../../components/common/navigation/Navigation';
import Header from '../../components/common/header/Header';
import { useRouter } from 'expo-router';
import FirebaseApp from '../../helpers/FirebaseApp';

const Dashboard = () => {

    const router = useRouter();

    const data = Array.from({ length: 5 });
    
    return (
        <SafeAreaView style={styles.container}>

            <Header title={ 'Home' }/>

            <ScrollView style={styles.body}>

                <Search/>
            
                <Restaurants/>

                <ForSale/>

                <Chatbot/>

            </ScrollView>

            <Navigation currentRoute={ 'Home' } />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    body: {
        padding: SIZES.medium,
        height: 100,
        marginBottom: 60,
        paddingBottom: 5
    }
});

export default Dashboard;