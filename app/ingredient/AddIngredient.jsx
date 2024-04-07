import { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { COLLECTIONS } from '../../constants';
import Navigation from '../../components/common/navigation/Navigation';
import Header from '../../components/common/header/Header';
import FirebaseApp from '../../helpers/FirebaseApp';
import { Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import getProfile from '../../hook/getProfile';

const AddIngredient = () => {
  const router = useRouter();
  const FBApp = new FirebaseApp();
  const { profile } = getProfile();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }) => {
    const existing = await FBApp.db.gets(COLLECTIONS.ingredients, { column: 'id', comparison: '==', value: data });
    setScanned(true);

    if (existing.filter(x => x.restaurantId === profile.adminId).length > 0) {
      router.replace(`/ingredient/add-batch/${existing[0].id}`);
    } else {
      router.replace(`/ingredient/add-from-scan/${data}`);
    }
  };

  useEffect(() => {
    getCameraPermissions();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        hideTitle={true}
        hideNotification={true}
        showBack={{
          show: true,
          handleBack: () => router.replace('/inventory/Inventory'),
        }}
      />
      <View style={styles.body}>
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <Navigation currentRoute="Inventory" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingBottom: 5,
  },
});

export default AddIngredient;