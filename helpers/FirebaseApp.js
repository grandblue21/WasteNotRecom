import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getFirestore, addDoc, collection, getDoc, getDocs, updateDoc, deleteDoc, query, where, limit, orderBy } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyD6QfjZ3kiDgfDBJ3k0OoS6CSjwCVysM_A',
    authDomain: 'wastenot-4f8dd.firebaseapp.com',
    databaseURL: 'https://wastenot-4f8dd.firebaseio.com',
    projectId: 'wastenot-4f8dd',
    storageBucket: 'wastenot-4f8dd.appspot.com',
    messagingSenderId: '755864780516',
    appId: '1:755864780516:android:443a723b6941f0b2ffb6f1',
    measurementId: 'G-T70SC3V0QR'
};
  
class FirebaseApp {
    
    constructor() {
        this._instance = initializeApp(firebaseConfig);
    }

    // Firebase Instance
    getInstance = () =>  {
        return this._instance;
    }

    // Firebase Authentication
    auth = () => {
        return getAuth(this._instance);
    }

    // Firestore
    firestore = () => {

        if (!this._firestore_instance) {
            this._firestore_instance = getFirestore(this._instance);
        }

        return this._firestore_instance;
    }

    // Database Helper
    db = {

        // Insert
        insert: async (collectionName, values) => {

            try {

                // Add Document
                const ref = await addDoc(collection(this.firestore(), collectionName), values);

                return ref;
                
            }
            catch (error) {
                console.log(error);
            }

            return false;
        },

        // Get more than one data
        gets: async (collectionName, filter = null, order = null) => {

            try {

                let q;

                if (filter && order) {
                    q = query(collection(this.firestore(), collectionName), where(filter.column, filter.comparison, filter.value), orderBy(order.column, order.direction));
                }
                else if (filter) {
                    q = query(collection(this.firestore(), collectionName), where(filter.column, filter.comparison, filter.value));
                }
                else if (order) {
                    q = query(collection(this.firestore(), collectionName), orderBy(order.column, order.direction));
                }
                else {
                    q = query(collection(this.firestore(), collectionName));
                }

                const dataSnapshot = await getDocs(q);

                let data = [];

                dataSnapshot.forEach((iteration) => data.push({ ...iteration.data(), id: iteration.id }));

                return data;
            }
            catch (error) {
                console.log(error);
            }

            return [];
        },

        // Get specific data
        get: async (collectionName, filter) => {

            try {

                const q = query(collection(this.firestore(), collectionName), where(filter.column, filter.comparison, filter.value), limit(1));
                
                const docSnapshot = await getDocs(q);

                // Check there are docs
                if (docSnapshot.docs.length > 0) {
                    return { ...docSnapshot.docs[0].data(), id: docSnapshot.docs[0].id };
                }
                else {
                    return null;
                }
            }
            catch (error) {
                console.log(error);
            }

            return null;
        },

        // Get data from Ref
        get_from_ref: async (collectionName, passedRef) => {

            try {
                
                const ref = doc(this.firestore(), collectionName, passedRef);

                const docSnapshot = await getDoc(ref);
                
                // Check there are doc
                if (docSnapshot.exists()) {
                    return { ...docSnapshot.data(), id: docSnapshot.id };
                }
                else {
                    return null;
                }
            }
            catch (error) {
                console.log(error);
            }

            return false;
        },

        // Update Data
        update: async (collectionName, values, filter) => {

            try {
                
                const ref = doc(this.firestore(), collectionName, filter);

                await updateDoc(ref, values);

                return true;

            }
            catch (error) {
                console.log(error);
            }

            return false;
        },
        
        delete: async (collectionName, filter) => {

            try {
                await deleteDoc(doc(this.firestore(), collectionName, filter));

                return true;
            }
            catch (error) {
                console.log(error);
            }

            return false;
        }
    }

    // Session Helper
    session = {

        // Set
        set: async (key, value) => {

            try {

                await ReactNativeAsyncStorage.setItem(key, value);

                return key;
            }
            catch (error) {
                console.log('Session Set Error: ', error);
            }

            return false;
        },

        // Get
        get: async (key) => {

            try {
                
                const item = await ReactNativeAsyncStorage.getItem(key);

                return item;

            }
            catch (error) {
                console.log('Session Get Error: ', error);
            }

            return false;
        },

        // Remove
        remove: async (key) => {

            try {
                
                const item = await ReactNativeAsyncStorage.removeItem(key);

                return item;

            }
            catch (error) {
                console.log('Session Remove Error: ', error);
            }

            return false;
        },

        // Clear
        clear: async () => {

            try {

                await ReactNativeAsyncStorage.clear();

                return true;
                
            }
            catch (error) {
                console.log('Session Clear Error: ', error);
            }

            return false;
        }

    }
}

export default FirebaseApp;