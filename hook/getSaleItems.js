import { useState, useEffect } from 'react';
import FirebaseApp from '../helpers/FirebaseApp';
import { COLLECTIONS } from '../constants';

const getSaleItems = (filter = null) => {

    const [saleItems, setSaleItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        
        setIsLoading(true);

        try {
            // Set FireBase App Instance
            const FBApp = new FirebaseApp();

            const data = await FBApp.db.gets(COLLECTIONS.sale_items, filter);

            setSaleItems(data);

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
        saleItems, isLoading, error, refetch
    }
}

export default getSaleItems;