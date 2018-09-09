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
  try {
    let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
    document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
  } catch (e) {
    console.error(e);
    document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
  }

  var modal = document.querySelectorAll('.modal');
  var modals = M.Modal.init(modal);

  // Login Users:

  // Logout Users:

  // Firebase Auth:

  // Upload Project:
  function submitProject(e){
      e.preventDefault();
      console.log("Submit Project Called: ");
      console.log(e);
      console.log(document.forms[0]);


      let elem = document.getElementById('uploadModal');
      let Modal = M.Modal.getInstance(elem);
      Modal.close();
      M.toast({html: 'I am a toast!'})

  }

  // Display Project:
  function displayProject(){

  }

  // Event Listeners:
  // Shortcuts to DOM Elements:
  let uploadProjectElement = document.getElementById('uploadForm');
  let signOutElement = document.getElementById('signOut');


  // Saves message on form submit.
  uploadProjectElement.addEventListener('submit',submitProject);
  // signOutButtonElement.addEventListener('click', signOut);

});


