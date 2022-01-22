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

import * as AMS from "./lib/ams/ams";

console.log("====absamsobject====");
let parsed1 = AMS.Parser.parse(
    // `
    // AAA:BBB;
    // CCC{};
    // \\DDD:{XXX{PPP}}aa;
    // \\DDD:EEE{
    //     AAA:BBB{
    //         XXX{
    //             YYY:ZZZ
    //         };PPP
    //     }
    // }{
    //     AAA
    // }EEE{
    //     WWW
    // }:{
    //     AAA
    // }/FFF:AAA
    // `
    // `\\AA\\BB:CC`
    //   `\\abc{hello};;`
    `AA:a{BB}`
);
// for (let invokable of parsed1.iterator()) {
//     console.log(invokable.toString());
// }
console.log(parsed1);
let executor = new AMS.PlainTextExecutor();
let result = executor.execute(parsed1);
console.log(parsed1.getStructureString());
