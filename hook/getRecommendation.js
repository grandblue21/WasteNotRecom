import { useState, useEffect } from 'react';
import FirebaseApp from '../helpers/FirebaseApp';
import { COLLECTIONS } from '../constants';

const getRecommendation = (filter = null) => {

    const [recommendation, setRecommendation] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        
        setIsLoading(true);

        try {
            // Set FireBase App Instance
            const FBApp = new FirebaseApp();

            const data = await FBApp.db.get(COLLECTIONS.recommendation, filter);

            setRecommendation(data ?? {});

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
        recommendation, isLoading, error, refetch
    }
}

export default getRecommendation;