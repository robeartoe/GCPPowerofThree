document.addEventListener('DOMContentLoaded', () => {
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
    timestampsInSnapshots: true,
  });

  let modal = document.querySelectorAll('.modal');
  let modals = M.Modal.init(modal);

  // Firebase Auth:
  function authUser() {
    // Listen to auth state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
  }

  // Auth State Change:
  // Triggers the auth state change for instance when user signs-in or out.
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
    return Boolean(firebase.auth().currentUser);
  }

  // Login Users:
  function loginUser() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }

  // Logout Users:
  function logoutUser() {
    // Sign out of Firebase.
    firebase.auth().signOut();
  }

  // Upload Project:
  function submitProject(e) {
    // Prevent from sending:
    e.preventDefault();
    // Get Upload Modal and close it:
    let elem = document.getElementById('uploadModal');
    let Modal = M.Modal.getInstance(elem);
    Modal.close();
    // Add User's project:
    let groupName = document.getElementById('groupName').value;
    let githubLink = document.getElementById('githubLink').value;
    let groupOne = document.getElementById('groupOne').value;
    let groupTwo = document.getElementById('groupTwo').value;
    let groupThree = document.getElementById('groupThree').value;
    let image = document.getElementById('fileLink').files[0];
    let imageURL = document.getElementById('fileLink').files[0].name;
    let projDisc = document.getElementById('projectDisc').value;

    db.collection('users').add({
      groupName: groupName,
      githubLink: githubLink,
      groupOne: groupOne,
      groupTwo: groupTwo,
      groupThree: groupThree,
      projectDisc: projDisc,
    }).then((docRef) => {
      let filePath = firebase.auth().currentUser.uid + '/' + imageURL;
      return firebase.storage().ref(filePath).put(image).then((fileSnapshot) => {
        return fileSnapshot.ref.getDownloadURL().then((url) => {
          return docRef.update({
            imageURL: url,
            storageUri: fileSnapshot.metadata.fullPath,
          }).then(() => {
            M.toast({html: 'Thank you! The project will be reviewed and posted ASAP.'});
            return null;
          });
        });
      });
    }).catch((error) => {
      M.toast({html: 'There was an error. Please get in touch if it happens again!'});
    });
  }

  // Display Project:
  function displayProject() {
    db.collection('users').get().then((querySnapshot) => {
      let index = 0;
      querySnapshot.forEach( (doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, ' => ', doc.data());
        projectHTML(doc.data(), index);
        index++;
        return null;
      });
    }).catch((error) => {
      console.log('error' + error);
    });
  }

  function projectHTML(docDATA, index) {
    console.log(docDATA);
    let div = document.createElement('div');
    div.className = 'row';
    div.style = 'text-align:center';
    div.innerHTML = `<h4>${docDATA.groupName}</h4>
<p>${docDATA.groupOne}, ${docDATA.groupTwo}, ${docDATA.groupThree}</p>
<a href=${docDATA.githubLink}><i id="projectFeather" data-feather="github"></i></a>
<img src=${docDATA.imageURL} alt='ProjectScreenshot' height='45%' width='65%'>
<p>${docDATA.projectDisc}</p>
`;
    if (index % 2 === 0) {
      $('#row1').append(div);
      $('#row1').append('<div class="divider"></div>');
      feather.replace();
    } else {
      $('#row2').append(div);
      $('#row2').append('<div class="divider"></div>');
      feather.replace();
    }
  }

  // Event Listeners:
  // Shortcuts to DOM Elements:
  let uploadProjectElement = document.getElementById('uploadForm');
  let uploadButtonElement = document.getElementById('uploadButton');
  let signOutButtonElement = document.getElementById('logoutButton');
  let signInElement = document.getElementById('loginButton');


  // Saves message on form submit.
  uploadProjectElement.addEventListener('submit', submitProject);
  signOutButtonElement.addEventListener('click', logoutUser);
  signInElement.addEventListener('click', loginUser);

  // initialize Firebase:
  authUser();
  displayProject();
});


