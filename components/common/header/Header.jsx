import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import ScreenHeaderBtn from './ScreenHeaderBtn';
import { FontAwesome } from '@expo/vector-icons';
import { FONT } from '../../../constants';

const Header = ({ title, showBack, hideTitle, hideNotification, showBackOverride }) => {
    return (
        <Stack.Screen options={{
            headerStyle: { backgroundColor: '#FFF' },
            headerShadowVisible: false,
            headerLeft: () => (
                showBack && showBack.show ?
                <ScreenHeaderBtn handlePress={ showBack.handleBack } component={(
                    <View style={ styles.back }>
                        <FontAwesome name={'chevron-left'} style={ styles.backIcon }/>
                    </View>
                )} /> :
                ( showBackOverride && !showBackOverride ? null : <ScreenHeaderBtn component={ null } />)
            ),
            headerRight: () => (
                hideNotification ? null :
                <ScreenHeaderBtn component={<FontAwesome name="bell-o" style={{ fontSize: 23 }} />} />
            ),
            headerTitle: () => (
                hideTitle ? null :
                <View style={styles.headerTitleWrapper}>
                    <Text style={styles.headerText}>{ title }</Text>
                </View>
            )
        }}/>
    )
}

const styles = StyleSheet.create({
    headerTitleWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerText: {
        fontFamily: FONT.medium,
        fontSize: 40,
        paddingRight: '22%'
    },
    back: {
        height: 38,
        width: 38,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
        marginTop: 6,
        borderWidth: 3,
        borderColor: '#097C31',
        borderRadius: 20
    },
    backIcon: {
        fontSize: 17,
        color: '#f8AF21',
        paddingRight: 2
    },
});

export default Header;