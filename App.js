import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StartPage from './components/StartPage';
import QuizPage from './components/QuizPage';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load categories
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        setCategories(data.trivia_categories || [{ id: 9, name: 'General Knowledge' }]);
        // Simulate other loading tasks if needed
        await new Promise((resolve) => setTimeout(resolve, 920)); // Simulated splash delay
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setIsAppReady(true);
      }
    };

    loadResources();
  }, []);

  if (!isAppReady) {
    return (
      <View style={styles.splashContainer}>
        <LottieView
          source={require('./assets/loading.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StartPage">
        <Stack.Screen
          name="StartPage"
          options={{ headerShown: false }}
        >
          {(props) => <StartPage {...props} categories={categories} />}
        </Stack.Screen>
        <Stack.Screen name="QuizPage" component={QuizPage} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030303',
  },
  lottie: {
    width: 500,
    height: 500,
  },
});

export default App;
