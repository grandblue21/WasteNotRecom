import { useEffect, useState } from 'react';
import getProfile from '../../hook/getProfile';
import getIngredients from '../../hook/getIngredients';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import Navigation from '../../components/common/navigation/Navigation';
import { SafeAreaView, Text, StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLLECTIONS, COLORS, SIZES, INGREDIENT_CLASSIFICATIONS, SPOONACULAR_API_KEY, images } from '../../constants';
import FirebaseApp from '../../helpers/FirebaseApp';
import getRecommendation from '../../hook/getRecommendation';
import moment from 'moment';

const Recommendation = () => {

    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const { ingredients, isLoading: isLI, refetch } =  getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const recommendation = getRecommendation({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [recommendations, setRecommendations] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [recFromDb, setRecFromDb] = useState(true);
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [recipeLoading, setRecipeLoading] = useState(true);
    const [showPrevious, setShowPrevious] = useState(false);
    const capitalizeText = (text) => text.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase());

    useEffect(() => {
        // Refetch if profile is loaded
        if (profile.adminId) {
            recommendation.refetch();
            refetch();
        }
    }, [profile.adminId]);

    useEffect(() => {
        if (!isLoading) {
            recommendation.refetch();
            refetch();
        }
    }, [isLoading]);

    useEffect(() => {

        const get_recommendations = async () => {

            try {

                // Create a cancel token source
                const source = axios.CancelToken.source();
                setCancelTokenSource(source);

                // In stock
                const in_stock = ingredients.filter((x) => parseInt(x.quantity_left) > 0);

                // Required count
                let required_count = 0;

                // Count reuqired ingredients
                in_stock.map((x) => {
                    x.classifications.map((y) => {
                        const z = INGREDIENT_CLASSIFICATIONS.find(x => x.name == y);

                        if (z.required) {
                            required_count++;
                        }
                    });
                });

                // Check if there are required ingredients in stock
                if (required_count == 0) {

                    setRecommendations('Apparently, you currently have no ingredients in stock that can be considered as a main or base ingredient to create a dish.');

                    return;
                }

                /*
                 * Chatgpt
                 */

                // const options = {
                //     method: 'POST',
                //     url: 'https://chatgpt53.p.rapidapi.com/',
                //     headers: {
                //     'content-type': 'application/json',
                //     'X-RapidAPI-Key': 'afab6284a5mshae6dd43c22e53a1p14328bjsn3e3a0c4e172d',
                //     'X-RapidAPI-Host': 'chatgpt53.p.rapidapi.com'
                //     },
                //     data: {
                //         messages: [
                //             {
                //                 role: 'user',
                //                 content: `
                //                     As a Chef, write three Asian or Filipino recipes strictly, remember strictly using only the ingredients mentioned and please do not add ingredient not specified below:
                //                     ` + (in_stock.map(x => (`- ${ x.Item_name }, can be used as ${ (x.classifications.join(', ')) }`)).join('\n')) + `
                //                     . Reply including raw minified array json in the end with format: [{name: 'string', ingredients: 'array', instructions: 'array'}] after a phrase capitalized "HERE IS YOUR JSON FORMAT:"
                //                 `.trim()
                //             }
                //         ],
                //         temperature: 1
                //     }
                // };

                // // Get response
                // const response = await axios.request(options);

                // // Retreive json
                // const json_string = getContentBetweenBrackets(response.data.choices[0].message.content);

                // // Minify and convert
                // const converted_json = JSON.parse(cleanString(json_string));

                // // Set recommendation
                // setRecommendations('Possible recipes:');
                // setRecipes(converted_json ? converted_json : []);



                // Get existing
                
                /*
                 * Spoonacular
                 */
                let response;
                try {
                    response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${in_stock.map(x => x.Item_name.toLowerCase()).join(',')}&number=3&limitLicense=false&ignorePantry=false&apiKey=${SPOONACULAR_API_KEY}`, {
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
            catch (error) {
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

            // Check matches
            const match = recommendation.recommendation.find((x) => JSON.stringify(x.ingredients.sort()) == JSON.stringify(ingredients.filter((x) => parseInt(x.quantity_left) > 0).map((x) => x.ItemId).sort()));

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
            if (recipes.length > 0) {

                // Update recommendation
                const existing = await FBApp.db.gets(COLLECTIONS.recommendation, { column: 'Restaurant_id', comparison: '==', value: profile.adminId });

                // Update if existing
                if (existing) {
                    FBApp.db.update(COLLECTIONS.recommendation, {
                        ingredients: ingredients.filter((x) => parseInt(x.quantity_left) > 0).map((x) => x.ItemId),
                        recipes: recipes,
                        date: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, existing.id);
                }
                // Save
                else {
                    FBApp.db.insert(COLLECTIONS.recommendation, {
                        Restaurant_id: profile.adminId,
                        ingredients: ingredients.filter((x) => parseInt(x.quantity_left) > 0).map((x) => x.ItemId),
                        recipes: recipes
                    });
                }

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
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{ moment(rec?.date).format('MMMM DD, YYYY') }</Text>
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
                <Text style={ styles.recommendation }>{ recommendations }</Text>
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
                                        {
                                            [...recipe.missedIngredients, ...recipe.usedIngredients].map((ingredient, i) => (
                                                <Text key={i} style={ styles.ingredient }> - { capitalizeText(ingredient.name) }</Text>
                                            ))
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
        marginBottom: 10,
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