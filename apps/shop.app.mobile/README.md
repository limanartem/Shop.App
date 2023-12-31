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
     * if needed app will be pre-built using `npx expo prebuild`, e.g. if android/ios folders are missing
     * You may need to set java home env
       * `export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home`
     * To package for release add command param: `--variant release`

# Deploying to EAS
* `eas.json` contains configs for different build flavors and environments
* Before running build you should authenticate using `eas login`
* In order for eas build to successfully complete on expo.dev local `packages/` dependencies have to be pre-built, therefore `apps/shop.app.mobile/package.json` has a `postinstall` task which triggers root npm package task `build:packages`, which builds all packages

## Android builds
* To trigger build on expo.dev build environment use `eas build -p android`
* To select specific profile add e.g. ` --profile preview`
* Some profiles configured to produce `apk` files, which can be manually installed on android devices, wheres others produce `aab` files that can only be used for store deployment 
* Read more docs - [Build your project for app stores](https://docs.expo.dev/deploy/build-project/)

## Builds troubleshooting
* It seems that currently expo.dev has issues building latest `expo@49.0.21` and `react-native@0.73.1` packages. Running `npx expo install --check` would suggest to downgrade to `react-native@0.72.6`, which does not work well for shop.app.mobile as it gets stuck on start. But to test build on expo.dev, run check tool and apply suggested downgrades, this would allow to pass build on expo.dev, but app would not be runnable. Currently it is unclear what is causing this

# Packages used
* [React Native Paper](https://callstack.github.io/react-native-paper/docs/guides/getting-started) - for Material UI components for ReactNative
* [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) - for fast key/value based storage
* `supertokens-react-native` and `supertokens-web-js` are both used depending on the build target platform.
  * `supertokens-react-native` for all mobile targets
  * `supertokens-web-js` only for web targets
  * Both packages are included as dependencies, but only one is used at a runtime to init authentication flow, verify tokens etc