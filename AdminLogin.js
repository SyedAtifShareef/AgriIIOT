import { initializeApp} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";  
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";


    //   import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";
      

      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

      const form = document.querySelector('.form');
      form.addEventListener('submit', adminLogin);
      function getUserDetails(uid){
        let result;
        const dbRef = ref(getDatabase());
        get(child(dbRef, `Users/${uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            result = snapshot.val();
            console.log(result)
            handleRedirect(result);
        } else {
            console.log("No data available");
        }
        }).catch((error) => {
        console.error(error);
        });
      }


      
      function handleRedirect(res){
        console.log('handleredirect called with values '+ res)
        if (res.Role === "Owner") {
          window.location.href = "Adminpage.html";
        } else {
          alert("Invalid login attempt for Admin."); 
        }
    }

      function adminLogin(e) {
        e.preventDefault();
        console.log('Admin login called')
        console.log(auth);
        const Email = document.getElementById("email").value;
        const Password = document.getElementById("password").value;
        console.log(Email,Password, signInWithEmailAndPassword)
        signInWithEmailAndPassword(auth, Email, Password)
          .then((userCredential) => {
            console.log(userCredential)
            const user = userCredential.user;
            console.log(user);
            localStorage.setItem('userAuth', user.uid)
            return getUserDetails(user.uid);
          }) 
          .catch((error) => {
            console.error("Error during sign-in:", error);
            alert("Login failed. Please try again.");
          });
        }
