 
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
   import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
 
  const firebaseConfig = {
    apiKey: "AIzaSyDkebKK0auUuSWfxk6Jh8ygbLCw-uc6JkA",
    authDomain: "social-app-1040f.firebaseapp.com",
    databaseURL: "https://social-app-1040f-default-rtdb.firebaseio.com",
    projectId: "social-app-1040f",
    storageBucket: "social-app-1040f.appspot.com",
    messagingSenderId: "494258343404",
    appId: "1:494258343404:web:07e157604c45a6a44b04c9",
    measurementId: "G-8GBCGJF70B"
  };


  
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
   export const db = getFirestore(app);
   export { collection, addDoc, getDocs, query, where  };
  