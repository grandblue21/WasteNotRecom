import { useState, useRef, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Keyboard, TouchableOpacity, Image, TextInput, ToastAndroid } from 'react-native';
import { COLORS, FONT, SIZES, COLLECTIONS } from '../../constants';
import Search from '../../components/home/search/Search';
import Navigation from '../../components/common/navigation/Navigation';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../../components/common/header/Header';
import axios from 'axios';
import FirebaseApp from '../../helpers/FirebaseApp';
import getProfile from '../../hook/getProfile';
import { Timestamp } from 'firebase/firestore';

const Chatbot = () => {
    
    // Initialize Input Query
    const [inputQuery, setInputQuery] = useState('');

    // Initialize Conversation
    const [conversation, setConversation] = useState([]);

    // Reference for Scroll View Component
    const scrollViewRef = useRef(null);

    // Get Profile
    const session = getProfile();

    // Set Firebase Instance
    const FBApp = new FirebaseApp();

    // Scroll to bottom
    const toBottom = () => scrollViewRef.current.scrollToEnd({ animated: true });

    // Save Message
    const newMessage = async (isBot, message) => {

        try {

            // Update Conversation
            await FBApp.db.insert(COLLECTIONS.chat, {
                user_id: session.profile.userId,
                isBot: isBot,
                message: message,
                created_at: Timestamp.fromDate(new Date())
            });

            setConversation((prev) => ([...prev, {
                isBot: isBot,
                message: message
            }]));

            // To Bottom
            toBottom();
        }
        catch (error) {
            console.log(error);
        }
    }

    // Handle Send Message
    const handleSend = async () => {

        // Check if not empty
        if (!inputQuery) {
            ToastAndroid.showWithGravity('Please specifiy your prompt', ToastAndroid.LONG, ToastAndroid.TOP);
            return false;
        }

        // Hide keyboard
        Keyboard.dismiss();

        // Request options
        const options = {
            method: 'POST',
            url: 'https://simple-chatgpt-api.p.rapidapi.com/ask',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': '8231d19192mshf4eaa13ac5f975ep1d0bdfjsn6854d94de527',
                'X-RapidAPI-Host': 'simple-chatgpt-api.p.rapidapi.com'
              },
            data: {
                question: 'As a Chef, ' + inputQuery
            }
        }

        // Include to convo
        await newMessage(false, inputQuery);

        // Empty input query
        setInputQuery('');
        
        try {

            // Perform request
            const response = await axios.request(options);

            // Include to conversation
            newMessage(true, response.data.answer);

            // Scroll to bottom
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
        catch (error) {console.log(error);
            // Show notif
            ToastAndroid.showWithGravity('WasteNot AI cannot reply. Please try again later.', ToastAndroid.LONG, ToastAndroid.TOP);
        }
    }

    // Chat Images
    const images = (isBot) => {
        return isBot ? require('../../assets/images/logos/normal.png') : {
            uri: 'https://cdn1.iconfinder.com/data/icons/contact-contact-us-communication-social-media-se-3/32/Contact-09-512.png'
        }
    }
    
    // Get Conversation
    const getConversationData = async () => {

        try {

            // Get Convo
            const convo = await FBApp.db.gets(COLLECTIONS.chat, {
                column: 'user_id',
                comparison: '==',
                value: session.profile.userId
            }, {
                column: 'created_at',
                direction: 'asc'
            });
        
            // Set Conversation
            setConversation(convo.length > 0 ? convo : [{
                isBot: true,
                message: 'Hi! How can I help you today?'
            }]);

            // Scroll to bottom
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
        catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };
    
    useEffect(() => {
        // Only get conversation of session is loaded
        if (session.profile && session.profile.user_id) {
            getConversationData();
        }
    }, [session.profile]);
    
    return (
        <SafeAreaView style={styles.container}>

            <Header title={ 'Chatbot' }/>

            <View style={styles.body}>

                <Search/>

                <ScrollView style={styles.convoContainer} ref={scrollViewRef}>
                    {
                        conversation.map((chat, index) => (
                            <View key={index} style={styles.chatItem(chat.isBot)}>
                                <Image source={images(chat.isBot)} style={styles.chatImage(chat.isBot)}></Image>
                                <View style={styles.chatTextContainer}>
                                    <Text style={styles.chatText(chat.isBot)}>{chat.message}</Text>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>

            </View>

            <View style={styles.chatInputWrapper}>
                <View style={styles.chatInputContainer}>
                    <TextInput style={styles.chatInput} onChangeText={input => setInputQuery(input)} value={inputQuery}/>
                    <TouchableOpacity style={styles.chatInputIcon} onPress={handleSend}>
                        <FontAwesome name="send-o" style={{ fontSize: 30 }} />
                    </TouchableOpacity>
                </View>
            </View>

            <Navigation currentRoute={ 'Chat-bot' } />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: SIZES.xLarge,
        backgroundColor: '#FFF'
    },
    body: {
        flex: 1,
        padding: 3,
        backgroundColor: '#FFF',
        marginBottom: 75,
        paddingBottom: 5
    },
    convoContainer: {
        flexGrow: 1,
        backgroundColor: '#F4EDED',
        borderColor: COLORS.primary,
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        marginBottom: 30
    },
    chatImage: (isBot) => {
        return isBot ? {
            height: 71,
            width: 71,
            marginRight: 6
        } : {
            height: 71,
            width: 71,
            marginLeft: 6
        }
    },
    chatItem: (isBot) => {
        return isBot ? {
            flexDirection: 'row',
            marginBottom: 25
        } : {
            flexDirection: 'row-reverse',   
            marginBottom: 25,
            justifyContent: 'flex-end'
        }
    },
    chatTextContainer: {
        flex: 1,
        borderColor: COLORS.primary,
        borderWidth: 1,
        borderRadius: 30,
        backgroundColor: '#FFF',
        paddingVertical: 25,
        paddingHorizontal: 16,
        maxWidth: '80%'
    },
    chatText: (isBot) => {
        return isBot ? {
            fontSize: 15,
            fontWeight: '900',
        } : {
            fontSize: 15,
            fontWeight: '900',
            textAlign: 'right'
        }
    },
    chatInputWrapper: {
        backgroundColor: COLORS.primary,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: 115,
        borderRadius: 25
    },
    chatInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#ECECEC',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: 10,
        position: 'absolute',
        bottom: 0,
        marginBottom: 62,
        marginHorizontal: 7
    },
    chatInput: {
        flex: 1,
        height: 46,
        fontSize: 20,
        fontWeight: '900',
        paddingHorizontal: 10
    },
    chatInputIcon: {
        height: 46,
        width: 46,
        justifyContent: 'center',
        alignItems: 'center'
    }
});


export default Chatbot;