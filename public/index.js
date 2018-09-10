document.addEventListener('DOMContentLoaded', function() {
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    let app = firebase.app();
    let db = firebase.firestore();
    // Disable deprecated features
    db.settings({
        timestampsInSnapshots: true
    });

    var modal = document.querySelectorAll('.modal');
    var modals = M.Modal.init(modal);

    // Firebase Auth:
    function authUser() {
        // Listen to auth state changes.
        firebase.auth().onAuthStateChanged(authStateObserver);
    }

    //Auth State Change:
    // Triggers when the auth state change for instance when the user signs-in or signs-out.
    function authStateObserver(user) {
        if (user) { // User is signed in!
            // Set the user's profile pic and name.
            // Show user's profile and sign-out button.
            uploadButtonElement.classList.remove('hide');
            signOutButtonElement.classList.remove('hide');

            // Hide sign-in button.
            signInElement.classList.add('hide');

        } else { // User is signed out!
            // Hide user's profile and sign-out button.
            uploadButtonElement.classList.add('hide');
            signOutButtonElement.classList.add('hide');

            // Show sign-in button.
            signInElement.classList.remove('hide');
        }
    }

    // Returns true if a user is signed-in.
    function isUserSignedIn() {
        return !!firebase.auth().currentUser;
    }

    // Login Users:
    function loginUser() {
        // Sign in Firebase using popup auth and Google as the identity provider.
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    }

    // Logout Users:
    function logoutUser() {
        // Sign out of Firebase.
        firebase.auth().signOut();
    }

    // Upload Project:
    function submitProject(e){
        //Prevent from sending:
        e.preventDefault();
        //Get Upload Modal and close it:
        let elem = document.getElementById('uploadModal');
        let Modal = M.Modal.getInstance(elem);
        Modal.close();
        //Add User's project:
        let groupName = document.getElementById('groupName').value;
        let githubLink = document.getElementById('githubLink').value;
        let groupOne = document.getElementById('groupOne').value;
        let groupTwo = document.getElementById('groupTwo').value;
        let groupThree = document.getElementById('groupThree').value;
        let image = document.getElementById('fileLink').files[0];
        let imageURL = document.getElementById('fileLink').files[0].name;

        db.collection("users").add({
            groupName: groupName,
            githubLink: githubLink,
            groupOne: groupOne,
            groupTwo: groupTwo,
            groupThree: groupThree,
        }).then(function(docRef){
            let filePath = firebase.auth().currentUser.uid +  '/' + imageURL;
            return firebase.storage().ref(filePath).put(image).then(function (fileSnapshot) {
                return fileSnapshot.ref.getDownloadURL().then((url) => {
                    return docRef.update({
                        imageURL: url,
                        storageUri: fileSnapshot.metadata.fullPath
                    }).then(() => {
                        M.toast({html:'Thank you! The project will be reviewed and posted ASAP.'});
                    });
                });
            });
        }).catch(function(error){
            M.toast({html:'There was an error. Please get in touch if it happens again!'});
        });

    }

    // Display Project:
    function displayProject(){

    }

    // Event Listeners:
    // Shortcuts to DOM Elements:
    let uploadProjectElement = document.getElementById('uploadForm');
    let uploadButtonElement = document.getElementById('uploadButton');
    let signOutButtonElement = document.getElementById('logoutButton');
    let signInElement = document.getElementById('loginButton');


    // Saves message on form submit.
    uploadProjectElement.addEventListener('submit',submitProject);
    signOutButtonElement.addEventListener('click', logoutUser);
    signInElement.addEventListener('click',loginUser);

    // initialize Firebase
    authUser();
});


