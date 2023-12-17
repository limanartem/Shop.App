# Shop.App.Mobile

React Native project for Shop.App

## Installation

1. Clone the repository.
1. Install dependencies using `npm install`

## Usage

1. Start the development server using:
   * `npm start` - will allow to run app on mobile via `Expo Go` app
     * Scan the QR code with the Expo Go app on your mobile device.
     * See mode details [Setting up the development environment](https://reactnative.dev/docs/environment-setup)
     * For iOS you might need to to register see [Expo CLI - Authentication](https://docs.expo.dev/more/expo-cli/#authentication)
   * `npm start web` - will allow to run app from the browser
     * by default app will be available on `http://localhost:19006/`
   * `npm run android` or `npm run ios` - to run app using bare flow on a connected device or emulator
     * app would need to be pre-build using `npx expo prebuild`

# Packages used
* [React Native Paper](https://callstack.github.io/react-native-paper/docs/guides/getting-started) - for Material UI components for ReactNative
* [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) - for fast key/value based storage