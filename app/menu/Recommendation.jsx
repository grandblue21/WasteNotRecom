import { useEffect, useState } from 'react';
import getProfile from '../../hook/getProfile';
import getIngredients from '../../hook/getIngredients';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import Navigation from '../../components/common/navigation/Navigation';
import { SafeAreaView, Text, StyleSheet, View, ScrollView, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { COLLECTIONS, COLORS, SIZES, SPOONACULAR_API_KEY, images } from '../../constants';
import FirebaseApp from '../../helpers/FirebaseApp';
import getRecommendation from '../../hook/getRecommendation';
import moment from 'moment';
import getMenu from '../../hook/getMenu';
import DropDownPicker from 'react-native-dropdown-picker';

const Recommendation = () => {

    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const { menu, refetch: refetchMenu } = getMenu({ column: 'userId', comparison: '==', value: profile.adminId });
    const { ingredients, isLoading: isLI, refetch } =  getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const recommendation = getRecommendation({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [recommendations, setRecommendations] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [recFromDb, setRecFromDb] = useState(true);
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [recipeLoading, setRecipeLoading] = useState(true);
    const [stock, setStock] = useState([]);
    const [showPrevious, setShowPrevious] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const capitalizeText = (text) => text.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase());
    const MINIMUM_INGREDIENT_NUMBER_TO_RECOMMEND = 3;

    // Dropdown
    const [filter1, setFilter1] = useState('');
    const [open, setOpen] = useState(false);
    const [filter2, setFilter2] = useState('');
    const [open2, setOpen2] = useState(false);

    // Handle filter submit
    const handleFilterSubmit = async () => {

        try {

            // Check if both is selected
            if (!filter1 || !filter2) {
                ToastAndroid.showWithGravity('Select Ingredients First', ToastAndroid.LONG, ToastAndroid.TOP); return;
            }

            // Hide filter
            setShowFilter(false);

            // Show getting
            setRecommendations(`Getting recipes for ${ filter1 } and ${ filter2 }...`);
    
            /*
             * Spoonacular
             */
            const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ filter1 },${ filter2 }&number=10&limitLicense=false&ignorePantry=false&apiKey=${SPOONACULAR_API_KEY}`);
            setRecommendations(`Possible recipes for ${ filter1 } and ${ filter2 }:`);
            setRecipes(response.data.map((x) => {

                // Check missed ingredients if there is
                x.usedIngredients = [...x.usedIngredients, ...x.missedIngredients.filter((y) => stock.map((z) => z.Item_name.toLowerCase()).includes(y.name.toLowerCase())).map((v) => {

                    // Modify name with inventory
                    v.name += ' (In Inventory)';

                    // Return
                    return x;
                })];

                // Update missed
                x.missedIngredients = x.missedIngredients.filter((y) => !stock.map((z) => z.Item_name.toLowerCase()).includes(y.name.toLowerCase()));

                // Return
                return x;
            }));
        }
        catch (error) {

            // Show filter
            setShowFilter(true);

            // Show error
            setRecommendations('WasteNot cannot recommend for now. Please try again later');
        }
    }

    useEffect(() => {
        // Refetch if profile is loaded
        if (!isLoading && profile.adminId) {
            refetchMenu();
            recommendation.refetch();
            refetch();
        }
    }, [profile, isLoading]);

    useEffect(() => {

        const get_stock = () => {

            // In stock
            let in_stock = ingredients.filter((x) => parseInt(x.quantity_left) > 0);

            // Set stock
            setStock(in_stock.filter((x) => menu.map((y) => y.ingredientsList.map((z) => z.ingredients.toLowerCase()).includes(x.Item_name.toLowerCase())).length > 0));
        }

        if (ingredients.length > 0) {
            get_stock();
        }
    }, [ingredients]);

    useEffect(() => {

        const get_recommendations = async () => {

            try {

                // Create a cancel token source
                const source = axios.CancelToken.source();
                setCancelTokenSource(source);

                // In stock
                let in_stock = ingredients.filter((x) => parseInt(x.quantity_left) > 0);

                // Filter required
                in_stock = in_stock.filter((x) => menu.map((y) => y.ingredientsList.map((z) => z.ingredients.toLowerCase()).includes(x.Item_name.toLowerCase())).length > 0);

                // Check if there are required ingredients in stock
                if (in_stock.length == 0) {

                    setRecommendations('Apparently, you currently have no ingredients in stock to recommend a dish');

                    return;
                }

                // Check if in stock available can recommend
                if (in_stock.length < MINIMUM_INGREDIENT_NUMBER_TO_RECOMMEND) {

                    setRecommendations(`Apparently, you need atleast ${ MINIMUM_INGREDIENT_NUMBER_TO_RECOMMEND } ingredients in stock to recommend a dish.`);

                    return;
                }

                /*
                 * Spoonacular
                 */
                try {
                    const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${in_stock.map(x => x.Item_name.toLowerCase()).join(',')}&number=10&limitLicense=false&ignorePantry=false&apiKey=${SPOONACULAR_API_KEY}`, {
                        cancelToken: source.token
                    });
                    setRecommendations('Possible recipes:');
                    setRecipes(response.data);
                    setRecipeLoading(false);
                }
                catch (error) {

                    // Throw error on non-cancel related errors
                    if (!axios.isCancel(error)) {
                        throw error.message;
                    }
                }
            }
            catch (error) {console.log('E', error);
                setRecommendations('WasteNot cannot recommend for now. Please try again later');
            }
        }

        // Only get if record from db is empty
        if (!recFromDb) {
            if (isLI) {
                setRecommendations('Analyzing ingredients and getting possible recipes...');
            }
            else if (!isLI && ingredients.length > 0) {
                get_recommendations();
            }
            else {
                setRecommendations('No ingredients available');
            }
        }

        // Cleanup function to cancel the request when the component unmounts
        return () => {
            cancelTokenSource && cancelTokenSource.cancel();
        };
    }, [recFromDb, isLI, ingredients]);

    useEffect(() => {
        // Get recommendation
        if (!recommendation.isLoading) {

            // In stock
            let in_stock = ingredients.filter((x) => parseInt(x.quantity_left) > 0);

            // Filter required
            in_stock = in_stock.filter((x) => menu.map((y) => y.ingredientsList.map((z) => z.ingredients.toLowerCase()).includes(x.Item_name.toLowerCase())).length > 0);

            // Check matches
            const match = recommendation.recommendation.find((x) => JSON.stringify(x.ingredients.sort()) == JSON.stringify(in_stock.map((x) => x.Item_name).sort()));

            // There are recipes and recipes in inventory matches the ingredients for the recipe, if not get new set of recipes
            if (match) {
                setRecipes(match.recipes);
            }
            else {
                setRecFromDb(false);
            }
        }
    }, [recommendation]);

    useEffect(() => {

        // Update recommendations
        const update = async () => {

            // There is recipe
            if (recipes.length > 0 && !recFromDb) {

                // Include recipes
                FBApp.db.insert(COLLECTIONS.recommendation, {
                    Restaurant_id: profile.adminId,
                    ingredients: ingredients.filter((x) => parseInt(x.quantity_left) > 0).map((x) => x.Item_name),
                    recipes: recipes,
                    date: moment().format('YYYY-MM-DD HH:mm:ss')
                });

            }
        }
        
        // Not loading
        if (!recipeLoading) {
            update();
        }

    }, [recipeLoading]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={ styles.body }>
                {
                    showPrevious && <View style={{ flex: 1, marginBottom: 10 }}>
                        {
                            recommendation.recommendation.sort((a, b) => moment(a.date ?? moment().format('YYYY-MM-DD HH:mm:ss')) > moment(b.date ?? moment().format('YYYY-MM-DD HH:mm:ss'))).map((rec) => (
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{ moment(rec?.date).format('MMMM DD, YYYY - h:mm A') }</Text>
                                        {/* <TouchableOpacity onPress={ () => {
                                            setRecipes(rec.recipes); setShowPrevious(!showPrevious);
                                        } }>
                                            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Show</Text>
                                        </TouchableOpacity> */}
                                    </View>
                                    {
                                        rec.recipes.map((x, i) => (
                                            <Text>{ i + 1 }.  {x.title}</Text>
                                        ))
                                    }
                                </View>
                            ))
                        }
                    </View>
                }
                {
                    recommendation.recommendation.length > 0 && <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={ () => setShowPrevious(!showPrevious) }>
                            <Text style={{ textAlign: 'right' }}>{ showPrevious ? 'Hide' : 'Show' } Previous Recommendations</Text>
                        </TouchableOpacity>
                    </View>
                }
                <Text style={ styles.title }>What can I cook?</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ ...styles.recommendation, width: '75%' }}>{ recommendations }</Text>
                    {
                        stock.length > 0 && (
                            <TouchableOpacity onPress={ () => setShowFilter(!showFilter) }>
                                <Text style={{ fontWeight: '800', fontSize: 14 }}>Filter</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
                {
                    showFilter && (
                        <View style={{ flex: 1, backgroundColor: COLORS.primary, padding: 10, borderRadius: 5, marginBottom: 10, zIndex: 10 }}>
                            <Text style={{ fontSize: 16, color: 'white', fontWeight: '800', marginBottom: 10 }}>Recommend Recipes from 2 active inventory ingredients:</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: 'white' }}>First Ingredient</Text>
                                    <DropDownPicker
                                        open={ open }
                                        value={ filter1 }
                                        items={ stock.map((x) => ({ label: x.Item_name, value: x.Item_name })) }
                                        setOpen={ setOpen }
                                        setValue={ setFilter1 }
                                        placeholder=""
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: 'white' }}>Second Ingredient</Text>
                                    <DropDownPicker
                                        open={ open2 }
                                        value={ filter2 }
                                        items={ stock.map((x) => ({ label: x.Item_name, value: x.Item_name })) }
                                        setOpen={ setOpen2 }
                                        setValue={ setFilter2 }
                                        placeholder=""
                                    />
                                </View>
                            </View>
                            <TouchableOpacity onPress={ handleFilterSubmit} style={{ padding: 5, backgroundColor: '#D9D9D9' }}>
                                <Text style={{ textAlign: 'center' }}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
                {
                    recipes.length > 0 ? recipes.map((recipe, index) => (
                        <>
                            <View style={ styles.itemContainer } key={ index }>
                                {/* Background Container */}
                                <View style={ styles.backgroundContainer }>
                                    {/* Recipe Name */}
                                    <View style={ styles.itemInfoContainer }>
                                        <View style={ styles.itemDetails }>
                                            <Image src={ recipe.image } style={ styles.itemImageThumb }/>
                                            <Text style={ styles.itemName }>{ recipe.title }</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={ { paddingLeft: 10 } } onPress={ () => {
                                        setRecipes(recipes.map((x, i) => {

                                            if (i == index) {
                                                x.visible = !x.visible;
                                            }

                                            return x;
                                        }));
                                    } }>
                                        <AntDesign name="enter" size={ 20 } color="#389F4F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {
                                recipe.visible &&
                                <View style={ styles.recipeContainer }>
                                    <View style={ styles.recipeNameHeader }>
                                        <Text style={ styles.ingredientLabel }>Recipe</Text>
                                        <Text style={ styles.recipeName }>{ recipe.title }</Text>
                                        <Image src={ recipe.image } style={ styles.itemImage }/>
                                    </View>
                                    <View style={ styles.ingredientContainer }>
                                        <Text style={ styles.ingredientLabel }>Ingredients: </Text>
                                        <Text style={{ ...styles.ingredient, fontWeight: '900' }}> In store</Text>
                                        {
                                            recipe.usedIngredients.map((ingredient, i) => (
                                                <Text key={i} style={ styles.ingredient }> - { capitalizeText(ingredient.name) } ({ [ingredient.amount.toString(), ingredient.unitShort ? ingredient.unitShort : 'pc/s'].join(' ') })</Text>
                                            ))
                                        }
                                        {
                                            recipe.missedIngredients.length > 0 && (
                                                <>
                                                    <Text style={{ ...styles.ingredient, color: 'red', fontWeight: '900' }}> Missing</Text>
                                                    {
                                                        recipe.missedIngredients.map((ingredient, i) => (
                                                            <Text key={i} style={{ ...styles.ingredient, color: 'red' }}> - { capitalizeText(ingredient.name) } ({ [ingredient.amount.toString(), ingredient.unitShort ? ingredient.unitShort : 'pc/s'].join(' ') })</Text>
                                                        ))
                                                    }
                                                </>
                                            )
                                        }
                                    </View>
                                    {
                                        recipe.instructionsVisible && recipe.instructions && <View style={ styles.ingredientContainer }>
                                            <Text style={ styles.ingredientLabel }>Instructions: </Text>
                                            {
                                                recipe.instructions.map((instructions, i) => (
                                                    <Text key={i} style={ styles.ingredient }> { !Number.isInteger(parseInt(instructions[0])) && ((i + 1 )+ '.') } { instructions }</Text>
                                                ))
                                            }
                                        </View>
                                    }
                                    <TouchableOpacity onPress={ () => Promise.all(recipes.map(async (x, i) => {

                                        // Current
                                        if (i == index) {

                                                // No instructions yet
                                                if (!x.instructions) {
                                                    try {
                                                        let response_i = await axios.get(`https://api.spoonacular.com/recipes/${x.id}/analyzedInstructions?apiKey=${SPOONACULAR_API_KEY}`);
                                                        
                                                        // Based instruction
                                                        if (response_i.data.length > 0) {
                                                            x.instructions = response_i.data[0].steps.map((y) => y.step);
                                                        }
                                                        else {
                                                            x.instructions = ['Instructions not specified'];
                                                        }
                                                    }
                                                    catch (error) {
                                                        x.instructions = ['Failed to get recipe instructions :('];
                                                    }
                                                }

                                            // Toggle
                                            x.instructionsVisible = !x.instructionsVisible;
                                        }

                                        return x;
                                    })).then((x) => setRecipes(x)) }>
                                        <Text style={{ ...styles.ingredientLabel, textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 12, textAlign: 'right' }}>
                                            { recipe.instructionsVisible ? 'Hide' : 'View' } Instructions
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </>
                    )) : (!recipeLoading ? <Image src={ images.LIST_EMPTY_PLACEHOLDER_IMG } style={{ height: 200, width: 102, borderRadius: 10, backgroundColor: 'white', alignSelf: 'center' }} /> : '')
                }
            </ScrollView>

            <Navigation currentRoute="Menu"/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    ingredient: {
        paddingHorizontal: SIZES.small,
        color: '#FFFFFF'
    },
    ingredientLabel: {
        color: '#e3e3e3',
        fontSize: 18
    },
    ingredientContainer: {
        marginBottom: 10
    },
    recipeName: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 20,
        paddingHorizontal: SIZES.small,
        marginBottom: 5
    },
    recipeContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: SIZES.medium,
        borderRadius: 5,
        marginBottom: 10,
    },
    recipeNameHeader: {
        marginBottom: 10
    },
    container: {
        flex: 1,
        paddingTop: SIZES.xLarge,
        backgroundColor: '#FFF'
    },
    body: {
        flex: 1,
        padding: 3,
        backgroundColor: '#FFF',
        marginBottom: 65,
        paddingBottom: 15,
        paddingHorizontal: SIZES.large
    },
    title: {
        fontSize: 20,
        fontWeight: '900'
    },
    recommendation: {
        fontSize: 18,
        marginBottom: 10
    },
    itemContainer: {
        marginBottom: 10,
    },
    backgroundContainer: {
        backgroundColor: '#D9D9D9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 25,
        minHeight:80,
        shadowColor: '#5A5353',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 2,
            width: 1.4,
        },
    },
    statusIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: '8%', // Add some space to the right of the status indicator
    },
    itemInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Expand to take available space
    },
    itemDetails: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingRight: 60
    },
    itemImageThumb: {
        height: 50,
        width: 50,
        marginRight: 15,
        borderRadius: 15
    },
    itemImage: {
        height: 150,
        width: 150,
        borderRadius: 15,
        marginLeft: SIZES.small
    }
});

export default Recommendation;