const { initializeApp } = require("firebase/app");
const {
  initializeAppCheck,
  ReCaptchaV3Provider,
} = require("firebase/app-check");

window.addEventListener("load", (event) => {
  const app = initializeApp({
    // Your firebase configuration object
    apiKey: "AIzaSyDyoJP82aCSnjL3jD23Y_53ydyo3pm3qXA",
    authDomain: "ams-interpreter.firebaseapp.com",
    projectId: "ams-interpreter",
    storageBucket: "ams-interpreter.appspot.com",
    messagingSenderId: "408347381195",
    appId: "1:408347381195:web:b058cd9044cb4155e7ba4e",
  });

  // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
  // key is the counterpart to the secret key you set in the Firebase console.
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      "6LfaeBYeAAAAAHe1BkEIFxKfMZzfsNEwXca7XcKw"
    ),

    // Optional argument. If true, the SDK automatically refreshes App Check
    // tokens as needed.
    isTokenAutoRefreshEnabled: true,
  });
});
