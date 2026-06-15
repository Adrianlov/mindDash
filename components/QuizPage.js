import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import Sound from 'react-native-sound';
import { decodeHTMLEntities } from '../utils/htmlEntities';

const QuizPage = ({ route, navigation }) => {
    const { difficulty, category } = route.params;
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [shuffledAnswers, setShuffledAnswers] = useState([]);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);

    useEffect(() => {
        // Load background music
        const backgroundSound = new Sound('background.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Failed to load the sound', error);
            } else {
                backgroundSound.setNumberOfLoops(-1);
                backgroundSound.setVolume(0.5);
                backgroundSound.play();
            }
        });

        return () => {
            backgroundSound.stop(() => {
                backgroundSound.release();
            });
        };
    }, []);

    const correctSound = useRef(null);
    const wrongSound = useRef(null);
    const clickSound = useRef(null);

    useEffect(() => {
        correctSound.current = new Sound('correct.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) console.log('Failed to load correct sound', error);
        });
        wrongSound.current = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) console.log('Failed to load wrong sound', error);
        });
        clickSound.current = new Sound('click.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) console.log('Failed to load click sound', error);
        });

        return () => {
            if (correctSound.current) correctSound.current.release();
            if (wrongSound.current) wrongSound.current.release();
            if (clickSound.current) clickSound.current.release();
        };
    }, []);

    useEffect(() => {
        fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.response_code === 0 && data.results && data.results.every(question => question.question)) {
                    setQuestions(data.results);
                    setTimeLeft(15);
                } else {
                    alert('No questions available. Please try a different selection.');
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [category, difficulty]);

    useEffect(() => {
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
            setShuffledAnswers(answers.sort(() => Math.random() - 0.5));
        }
    }, [currentQuestionIndex, questions]);

    useEffect(() => {
        if (timeLeft > 0 && !isAnswerChecked) {
            const intervalId = setInterval(() => setTimeLeft((prevTime) => prevTime - 1), 1000);
            return () => clearInterval(intervalId);
        } else if (timeLeft === 0 && !isAnswerChecked) {
            setIsAnswerChecked(true);
        }
    }, [timeLeft, isAnswerChecked]);

    const handleAnswerSelect = (answer) => {
        if (!isAnswerChecked) {
            setSelectedAnswer(answer);
            setIsAnswerChecked(true);
            setTimeLeft(0);

            if (answer === questions[currentQuestionIndex].correct_answer) {
                setScore((prevScore) => prevScore + 1);
                correctSound.current.play();
            } else {
                wrongSound.current.play();
            }
        }
    };

    const handleNextQuestion = () => {
        clickSound.current.play();
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setTimeLeft(15);
    };

    if (loading) {
        return (
            <ImageBackground source={require('../assets/1.jpg')} style={styles.backgroundImage}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="80" color="#FFD700" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={require('../assets/1.jpg')} style={styles.backgroundImage}>
            <View style={styles.container}>
                {currentQuestionIndex >= questions.length ? (
                    <View style={styles.scoreContainer}>
                        <Text style={styles.header}>Quiz Completed!</Text>
                        <Text style={styles.score}>Your score: {score} out of {questions.length}</Text>
                        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.mainContent}>
                        <View style={styles.timerContainer}>
                            <Text style={styles.timer}>{!isAnswerChecked ? timeLeft : ''}</Text>
                        </View>
                        <View style={styles.questionContainer}>
                            <Text style={styles.question}>{decodeHTMLEntities(questions[currentQuestionIndex].question)}</Text>
                        </View>
                        <View style={styles.answersContainer}>
                            {shuffledAnswers.map((answer, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.answerButton,
                                        isAnswerChecked && answer === questions[currentQuestionIndex].correct_answer && styles.correctAnswer,
                                        isAnswerChecked && selectedAnswer === answer && answer !== questions[currentQuestionIndex].correct_answer && styles.incorrectAnswer,
                                    ]}
                                    onPress={() => handleAnswerSelect(answer)}
                                    disabled={isAnswerChecked}
                                >
                                    <Text style={styles.answerText}>{decodeHTMLEntities(answer)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.nextButtonContainer}>
                            {isAnswerChecked && (
                                <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                                    <Text style={styles.buttonText}>Next Question</Text>
                                </TouchableOpacity>
                            )}
                            {!isAnswerChecked && <View style={styles.nextButtonPlaceholder} />}
                        </View>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, resizeMode: 'cover' },
    container: { flex: 1, paddingHorizontal: 20, paddingVertical: 40, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    mainContent: { 
        flex: 1,
        justifyContent: 'space-between', 
    },
    timerContainer: { 
        height: 50,
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 2,
        position: 'relative', 
    },
    timer: { 
        fontSize: 35, 
        color: 'white', 
        fontWeight: 'regular',
        position: 'absolute',
    },
    questionContainer: { 
        height: 210, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 20, 
        paddingHorizontal: 10,
        fontFamily: 'PlayfairDisplay-Regular',
    },
    question: { 
        fontSize: 26, 
        color: '#FFFFFF',  
        textAlign: 'center',
        letterSpacing: 1,
        fontWeight: '300',
    },
    answersContainer: { 
        marginBottom: 25,
        flex: 1, 
        justifyContent: 'center', 
        opacity: 0.8,
    },
    answerButton: { 
        backgroundColor: '#6c757d', 
        paddingVertical: 10, 
        paddingHorizontal: 30, 
        borderRadius: 8, 
        marginVertical: 10, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fcfcfc',
    },
    answerText: { 
        fontSize: 15, 
        color: '#FFFFFF',
        letterSpacing: 1,
        fontWeight: '500',
    },
    correctAnswer: { 
        backgroundColor: '#28a745' 
    },
    incorrectAnswer: { 
        backgroundColor: '#dc3545' 
    },
    nextButtonContainer: { 
        alignItems: 'center',
        height: 70,
    },
    nextButton: { 
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 120,
        width: '60%',
        height: 55,
        alignSelf: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    nextButtonPlaceholder: { 
        height: 50 
    },
    buttonText: { 
        fontSize: 22,
        color: '#FFFFFF', 
        textAlign: 'center',
        fontWeight: '600',
    },
    scoreContainer: { 
        alignItems: 'center' 
    },
    header: { 
        fontSize: 35, 
        color: '#FFFFFF', 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    score: { 
        fontSize: 24, 
        color: '#FFD700', 
        marginBottom: 100,
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    loadingText: { 
        fontSize: 40, 
        fontFamily: "PlayfairDisplay-Regular", 
        paddingTop: 94
    },
});

export default QuizPage;
