import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

import styles from './screenheader.style'

const ScreenHeaderBtn = ({ component, handlePress }) => {
    return (
        <TouchableOpacity style={styles.btnContainer} onPress={handlePress}>
            {component}
        </TouchableOpacity>
    )
}

export default ScreenHeaderBtn;