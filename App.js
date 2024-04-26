import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const App = () => {
  const [joke, setJoke] = useState(null);
  const [error, setError] = useState(null);
  const [storedJokes, setStoredJokes] = useState([]);

  const fetchJoke = async () => {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      setJoke(response.data);
      setError(null); 

      await AsyncStorage.setItem('joke', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching joke:', error);
      setError('Failed to fetch joke. Please check your internet connection.'); 
    }
  };

  const fetchStoredJokes = async () => {
    try {
      // Retrieve stored jokes from AsyncStorage
      const storedJokes = await AsyncStorage.getItem('jokes');
      if (storedJokes) {
        setStoredJokes(JSON.parse(storedJokes));
      }
    } catch (error) {
      console.error('Error fetching stored jokes:', error);
    }
  };

  const fetchAndSaveJokes = async () => {
    try {
      const jokes = [];
      for (let i = 0; i < 10; i++) {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        jokes.push(response.data);
      }
      setStoredJokes(jokes);
      await AsyncStorage.setItem('jokes', JSON.stringify(jokes));
    } catch (error) {
      console.error('Error fetching and saving jokes:', error);
    }
  };

  useEffect(() => {
    // Check internet connection
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        fetchStoredJokes();
      }
    });

    // Check if there are stored jokes, if not, fetch and save 10 jokes
    fetchStoredJokes().then(() => {
      if (storedJokes.length === 0) {
        fetchAndSaveJokes();
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.jokeContainer}>
        {error ? (
          <Text style={styles.errorMessage}>{error}</Text>
        ) : (
          <View>
            {joke ? (
              <View>
                <Text style={styles.jokeSetup}>{joke.setup}</Text>
                <Text style={styles.jokePunchline}>{joke.punchline}</Text>
                <Button title="Get Another Joke" onPress={fetchJoke} />
              </View>
            ) : (
              storedJokes.length > 0 && (
                <View>
                  <Text style={styles.jokeSetup}>{storedJokes[0].setup}</Text>
                  <Text style={styles.jokePunchline}>{storedJokes[0].punchline}</Text>
                  <Button
                    title="Get Another Joke"
                    onPress={() => {
                      if (storedJokes.length === 1) {
                        setStoredJokes(storedJokes); // To trigger a re-render and reset to the first joke
                      } else {
                        setStoredJokes(storedJokes.slice(1).concat(storedJokes[0]));
                      }
                    }}
                    disabled={storedJokes.length === 1}
                  />
                </View>
              )
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jokeContainer: {
    width: '80%',
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  jokeSetup: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  jokePunchline: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default App;
