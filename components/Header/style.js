import { Platform, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native'

export default StyleSheet.create({

    container: {
        backgroundColor: '#333333',

    },
    resourceContainer: {
        backgroundColor: '#292929'
    },
    icon: {
        color: '#aaaaaa',
        fontSize: 22,
    },
    leftButtons: {

        display: Platform.OS === 'web' && Dimensions.get('window').width > 720 ? 'none' : 'flex',
    },
    centerMenuButtons: {
        display: Platform.OS === 'web' && Dimensions.get('window').width > 720 ? 'flex' : 'none',  
    },
    centerMenuButtons: {
        paddingBottom: 12,
    },
    centerMenuButtonsText: {
        color: '#aaaaaa',
        fontSize: 15,
        fontWeight: 'bold',
        marginRight: 30
    },
    logo:
    {
        resizeMode: "stretch",
        width: 126,
        height: 33,
        marginRight: 70,

        marginTop:5,
        marginBottom:10,
    },
        centerMenuButtons: {
        display: Platform.OS === 'web' && Dimensions.get('window').width > 720 ? 'flex' : 'none',  
    },
    // Media Query Mobile
    '@media only screen and (max-width: 600px)': {
        centerMenuButtonsText: {
            display: 'none',
        },
    },

});