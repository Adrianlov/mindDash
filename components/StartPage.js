import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Easing } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Sound from 'react-native-sound';
import { decodeHTMLEntities } from '../utils/htmlEntities';

const StartPage = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState(9);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  // Load click sound
  const clickSound = new Sound('click', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('Failed to load sound', error);
    }
  });

  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const playClickSound = () => {
    if (!clickSound || !clickSound.isLoaded()) {
      console.log('Click sound not loaded.');
      return;
    }
    clickSound.stop(() => {
      clickSound.play((success) => {
        if (!success) {
          console.log('Sound playback failed');
        }
      });
    });
  };

  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then((response) => response.json())
      .then((data) => {
        setCategories(data.trivia_categories || [{ id: 9, name: 'General Knowledge' }]);
      })
      .catch((error) => {
        console.log('Error fetching categories:', error);
      });
  }, []);

  const startQuiz = () => {
    playClickSound();
    navigation.navigate('QuizPage', { difficulty, category });
  };

  return (
    <ImageBackground source={require('../assets/1.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>mindDash</Text>
        <Text style={styles.label}>Difficulty:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={difficulty}
            onValueChange={(itemValue) => {
              playClickSound();
              setDifficulty(itemValue);
            }}
            style={styles.picker}
            dropdownIconColor="#FFD700"
          >
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        <Text style={styles.label}>Category:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => {
              playClickSound();
              setCategory(itemValue);
            }}
            style={styles.picker}
            dropdownIconColor="#FFD700"
          >
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={decodeHTMLEntities(cat.name)} value={cat.id} />
            ))}
          </Picker>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={startQuiz}
            style={[styles.button, !difficulty || !category ? styles.disabledButton : null]}
            disabled={!difficulty || !category}
            accessibilityLabel="Start the quiz"
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    fontSize: 65,
    color: '#fcfcfc',
    textAlign: 'center',
    marginTop: 50,
    textShadowColor: '#333',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  label: {
    fontSize: 25,
    color: '#E0E0E0',
    marginBottom: 15,
    fontWeight: '600',
    fontFamily: 'PlayfairDisplay-Regular',
  },
  pickerContainer: {
    backgroundColor: '#201',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
    borderWidth: 2,
    borderColor: 'white',
    opacity: 0.8,
  },
  picker: {
    height: 50,
    color: 'white',
    paddingHorizontal: 58,
    backgroundColor: '#001',
  },
  button: {
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 70,
    width: '60%',
    alignSelf: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  disabledButton: { backgroundColor: '#FFD70080' },
  buttonText: {
    fontSize: 23,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default StartPage;
