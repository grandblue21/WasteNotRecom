import { useState, useEffect } from 'react';
import FirebaseApp from '../helpers/FirebaseApp';
import { COLLECTIONS } from '../constants';

const getMenu = (filter = null) => {

    const [menu, setMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        
        setIsLoading(true);

        try {
            // Set FireBase App Instance
            const FBApp = new FirebaseApp();

            const data = await FBApp.db.gets(COLLECTIONS.menu, filter);

            setMenu(data);

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
        menu, isLoading, error, refetch
    }
}

export default getMenu;