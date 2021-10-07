import * as firebase from 'firebase';
require ("@firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyATz7Nk6ECcXWqQBVpSflRWCHfJrcbFpjY",
    authDomain: "wily-ea28b.firebaseapp.com",
    projectId: "wily-ea28b",
    storageBucket: "wily-ea28b.appspot.com",
    messagingSenderId: "887632847971",
    appId: "1:887632847971:web:e25aceb04ab4c399cc8456"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  export default firebase.firestore();