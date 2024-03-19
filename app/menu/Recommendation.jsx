import { useEffect, useState } from 'react';
import getProfile from '../../hook/getProfile';
import getIngredients from '../../hook/getIngredients';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import Navigation from '../../components/common/navigation/Navigation';
import { SafeAreaView, Text, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLLECTIONS, COLORS, SIZES, INGREDIENT_CLASSIFICATIONS } from '../../constants';
import FirebaseApp from '../../helpers/FirebaseApp';
import getRecommendation from '../../hook/getRecommendation';

const Recommendation = () => {

    const FBApp = new FirebaseApp();
    const { profile, isLoading } = getProfile();
    const { ingredients, isLoading: isLI, refetch } =  getIngredients({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const recommendation = getRecommendation({ column: 'Restaurant_id', comparison: '==', value: profile.adminId });
    const [recommendations, setRecommendations] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [recFromDb, setRecFromDb] = useState(true);


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

                const options = {
                    method: 'POST',
                    url: 'https://chatgpt146.p.rapidapi.com/chat',
                    headers: {
                        'content-type': 'application/json',
                        'X-RapidAPI-Key': 'afab6284a5mshae6dd43c22e53a1p14328bjsn3e3a0c4e172d',
                        'X-RapidAPI-Host': 'chatgpt146.p.rapidapi.com'
                    },
                    data: {
                        messages: [
                          {
                            role: 'user',
                            content: `
                                As a Chef, write three Asian or Filipino recipes strictly, remember strictly using only the ingredients mentioned and please do not add ingredient not specified below:
                                ` + (in_stock.map(x => (`- ${ x.Item_name }, can be used as ${ (x.classifications.join(', ')) }`))) + `
                                Reply including raw minified array json in the end with format: [{name: 'string', ingredients: 'array', instructions: 'array'}] after a phrase capitalized "HERE IS YOUR JSON FORMAT:"
                            `
                          }
                        ],
                        temperature: 0.8
                    }
                };

                // Get response
                const response = await axios.request(options);

                // Retreive json
                const json_string = response.data.content.substring(response.data.content.indexOf("HERE IS YOUR JSON FORMAT:") + ("HERE IS YOUR JSON FORMAT".length + 1));

                // Minify
                const minified_json = json_string.replace(/\n+/g, ' ').trim();

                console.log(options.data.query);console.log(response.data.content);console.log(json_string);console.log(minified_json);

                // Set recommendation
                setRecommendations('Possible recipes:');
                setRecipes(JSON.parse(JSON.parse(minified_json)));

                // Get existing
                const existing = await FBApp.db.get(COLLECTIONS.recommendation, { column: 'Restaurant_id', comparison: '==', value: profile.adminId });

                // Update if existing
                if (existing) {
                    FBApp.db.update(COLLECTIONS.recommendation, {
                        ingredients: ingredients.filter((x) => parseInt(x.quantity_left) > 0).map((x) => x.ItemId),
                        recipes: recipes
                    });
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
            catch (error) {console.log(error);
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
    }, [recFromDb, isLI, ingredients]);

    useEffect(() => {
        // Get recommendation
        if (!recommendation.isLoading) {
            // There are recipes and recipes in inventory matches the ingredients for the recipe, if not get new set of recipes
            if (recommendation.recommendation.recipes && JSON.stringify(recommendation.recommendation.ingredients) == JSON.stringify(ingredients.filter((x) => parseInt(x.quantity_left) > 0).map((x) => x.ItemId))) {
                setRecipes(recommendation.recommendation.recipes);
            }
            else {
                setRecFromDb(false);
            }
        }
    }, [recommendation]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={ styles.body }>
                <Text style={ styles.title }>What can I cook?</Text>
                <Text style={ styles.recommendation }>{ recommendations }</Text>
                {
                    recipes.map((recipe, index) => (
                        <>
                            <View style={ styles.itemContainer } key={ index }>
                                {/* Background Container */}
                                <View style={ styles.backgroundContainer }>
                                    {/* Recipe Name */}
                                    <View style={ styles.itemInfoContainer }>
                                        <View style={ styles.itemDetails }>
                                            <Text style={ styles.itemName }>{ recipe.name }</Text>
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
                                        <Text style={ styles.recipeName}>{ recipe.name }</Text>
                                    </View>
                                    <View style={ styles.ingredientContainer }>
                                        <Text style={ styles.ingredientLabel }>Ingredients: </Text>
                                        {
                                            recipe.ingredients.map((ingredient, i) => (
                                                <Text key={i} style={ styles.ingredient }> - { ingredient }</Text>
                                            ))
                                        }
                                    </View>
                                    <View style={ styles.ingredientContainer }>
                                        <Text style={ styles.ingredientLabel }>Instructions: </Text>
                                        {
                                            recipe.instructions.map((instructions, i) => (
                                                <Text key={i} style={ styles.ingredient }> { !Number.isInteger(parseInt(instructions[0])) && ((i + 1 )+ '.') } { instructions }</Text>
                                            ))
                                        }
                                    </View>
                                </View>
                            }
                        </>
                    ))
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
        
    },
    recipeName: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 20,
        paddingHorizontal: SIZES.small
    },
    recipeContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: SIZES.medium,
        borderRadius: 5,
        marginBottom: 10,
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold'
    },
});

export default Recommendation;