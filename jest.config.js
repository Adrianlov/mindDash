module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Ensure babel-jest handles JavaScript files
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native-community|react-navigation)', // Explicitly tell Jest to process certain libraries
  ],
  moduleFileExtensions: ['js', 'jsx'], // Process only JS and JSX files
};
