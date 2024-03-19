import { useState, useEffect } from 'react';
import FirebaseApp from '../helpers/FirebaseApp';

const getProfile = () => {

    const [profile, setProfile] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        
        setIsLoading(true);

        try {
            // Set FireBase App Instance
            const FBApp = new FirebaseApp();

            const userdata = await FBApp.session.get('user');

            setProfile(userdata && JSON.parse(userdata));

            setIsLoading(false);
        }
        catch (error) {
            setError(error);
        }
        finally {
            setIsLoading(false);
        }
    }
 
    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => {
        setIsLoading(true);
        fetchData();
    }

    return {
        profile, isLoading, error, refetch
    }
}

export default getProfile;