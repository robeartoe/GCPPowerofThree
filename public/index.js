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

  /** Firebase Auth: */
  function authUser() {
    // Listen to auth state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
  }

  /**
  * Auth State Change:
  * Triggers the auth state change for instance when user signs-in or out.
  * @param {userAuth} user
  */
  function authStateObserver(user) {
    if (user) { // User is signed in!
      // Set the user's profile pic and name.
      // Show user's profile and sign-out button.
      signOutButtonElement.classList.remove('hide');

      // Hide sign-in button.
      signInElement.classList.add('hide');
    } else { // User is signed out!
      // Hide user's profile and sign-out button.
      signOutButtonElement.classList.add('hide');

      // Show sign-in button.
      signInElement.classList.remove('hide');
    }
  }

  /** Returns true if a user is signed-in.
   * @return {boolean} isUserSignedIn
  */
  function isUserSignedIn() {
    return Boolean(firebase.auth().currentUser);
  }

  /** Login Users: */
  function loginUser() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((userCredential) => {
          db.collection('users').doc(userCredential.user.uid).get()
              .then((snapshot) => {
                if (snapshot.exists) {
                  return null;
                } else {
                  db.collection('users')
                      .doc(userCredential.user.uid)
                      .set({
                        hasVoted: false,
                        hasSubmitted: false,
                        UID: userCredential.user.uid,
                      })
                      .then((docRef) => {
                        return docRef;
                      })
                      .catch((error) => {
                        return error;
                      });
                }
              })
              .catch((error) => {
                console.log(error);
                return error;
              });
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
  }

  /**   // Logout Users: */
  function logoutUser() {
    // Sign out of Firebase.
    firebase.auth().signOut();
  }

  /**   // Upload Project:
   * @param {eventListener} e
   * @return {null}
  */
  function submitVote(e) {
    // Prevent from sending:
    e.preventDefault();

    // Get Upload Modal and close it:
    let elem = document.getElementById('uploadModal');
    const form = document.getElementById('uploadForm');

    console.log(elem);
    console.log(form);

    // Add User's project:
    const name = document.getElementById('formName').value;
    const projDisc = document.getElementById('projectDisc').value;
    const GCPDisc = document.getElementById('GCPDisc').value;

    // Validation(Required):
    if (name === '') {
      M.toast({html: 'Name can not be Empty!'});
      return null;
    }
    if (projDisc === '') {
      M.toast({html: 'Project Discription can not be Empty!'});
      return null;
    }
    if ( GCPDisc === '') {
      M.toast({html: 'GCP Discription can not be Empty!'});
      return null;
    }

    const githubLink = document.getElementById('githubLink').value;

    let image = document.getElementById('fileLink').files[0];
    let imageURL = '';
    let storageUri = '';

    // Upload Project:
    const uid = firebase.auth().currentUser.uid;
    db.collection('projects')
        .doc(uid)
        .set({
          name: name,
          githubLink: githubLink,
          projectDisc: projDisc,
          GCPDisc: GCPDisc,
        }).then((docRef) => {
          // Update User:
          console.log(docRef);

          db.collection('users').doc(uid).update({
            hasSubmitted: true,
          })
              .then((docref) => {
                M.toast({html: 'Thank you! Refresh the page and you should see your project!'});
              })
              .catch((error) => {
                console.log(error);
                M.toast({html: 'There was an error. Try it again! Please get in touch if it happens again!'});
              });
        }).catch((error) => {
          console.log(error);
          M.toast({html: 'There was an error. Try it again! Please get in touch if it happens again!'});
        });

    // Uploads file to Firebase Storage: (If image is provided)
    if (image != null) {
      uploadFile(image).then((data) => {
        db.collection('projects').doc(uid)
            .update({
              imageURL: data.imageURL,
              storageUri: data.storageUri,
            })
            .then((docRef) => {
              M.toast({html: 'Your file has been uploaded!'});
            })
            .catch((error) => {
              console.log(error);
              M.toast({html: 'There was an error. Try it again! Please get in touch if it happens again!'});
            });
      })
          .catch((error)=> {
            console.log(error);
            M.toast({html: 'There was an error. Try it again! Please get in touch if it happens again!'});
          });
    }

    let Modal = M.Modal.getInstance(elem);
    Modal.close();
  }

  /**   // Upload Project:
   * @param {file} image
   * @return {Promise} DictObject
  */
  function uploadFile(image) {
    let imageURL = document.getElementById('fileLink').files[0].name;
    const filePath = firebase.auth().currentUser.uid + '/' +imageURL;
    return new Promise(((resolve, reject) => {
      firebase.storage().ref(filePath).put(image)
          .then((fileSnapshot) => {
            fileSnapshot.ref.getDownloadURL()
                .then((url) => {
                  let data = {
                    storageUri: fileSnapshot.metadata.fullPath,
                    imageURL: url,
                  };
                  resolve(data);
                })
                .catch((error) => {
                  console.log(error);
                  reject(error);
                });
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
    }));
  }


  /** Display Project: */
  function displayProject() {
    db.collection('projects').get()
        .then((querySnapshot) => {
          let index = 0;
          querySnapshot.forEach( (doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, ' => ', doc.data());
            projectHTML(doc.data(), index);
            index++;
            return null;
          });
        }).catch((error) => {
          console.log('error' + error);
          return error;
        });
  }

  /** Outputs data from DB to HTML
   * @param {docRef} docDATA
   * @param {int} index
   */
  function projectHTML(docDATA, index) {
    let githubLink = '';
    if (docDATA.githubLink.length != 0) {
      githubLink = `<a href=${docDATA.githubLink}><i id="projectFeather" data-feather="github"></i></a>`;
    }

    let div = document.createElement('div');
    div.className = 'row';
    div.style = 'text-align:center; padding-top:0px;';
    div.innerHTML = `
    <div class="card">
      <div class="card-image">
        <img src=${docDATA.imageURL} alt='ProjectScreenshot'>
        <span class='card-title'>${docDATA.name}</span>
        <a class='btn-floating halfway-fab waves-effect waves-light light-blue darken-1'> <i class='material-icons'> add </i> </a>
      </div>
      <div class='card-content'>
        ${githubLink}
        <p>${docDATA.projectDisc}</p>
        <p>${docDATA.GCPDisc}</p>
      </div>
    </div>`;

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
  let signOutButtonElement = document.getElementById('logoutButton');
  let signInElement = document.getElementById('loginButton');
  let submitElement = document.getElementById('submitVote');

  // Saves message on form submit.
  // uploadButtonElement.addEventListener('click', submittedUser);
  signOutButtonElement.addEventListener('click', logoutUser);
  signInElement.addEventListener('click', loginUser);
  submitElement.addEventListener('click', submitVote);

  // initialize Firebase:
  authUser();
  displayProject();
});


