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
    let elem = document.getElementById('confirmVote');
    let input = document.getElementById('inputID');


    // Cast Vote:
    const uid = firebase.auth().currentUser.uid;
    let proj = db.collection('projects').doc(input.value);
    let user = db.collection('users').doc(uid);

    // Check if user has voted:
    user.get().then((docRef) => {
      if (docRef.data().hasVoted) {
        M.toast({html: 'You have voted already!'});
        return null;
      }
    })
        .catch((error) => {
          console.log(error);
        });

    db.runTransaction((transaction) => {
      // This code may get re-run multiple times if there are conflicts.
      return transaction.get(proj).then((projDoc) => {
        if (!projDoc.exists) {
          throw 'Document does not exist!';
        }

        console.log(projDoc);
        console.log(projDoc.data());
        console.log(projDoc.data().votes);

        let newPopulation = 1;

        if (projDoc.data().votes == null) {
          transaction.update(proj, {votes: newPopulation});
        } else {
          console.log(projDoc.data().votes);
          let newVote = projDoc.data().votes + 1;
          console.log(newVote);
          transaction.update(proj, {votes: newVote});
        }

        transaction.update(user, {hasVoted: true});
      });
    }).then(() => {
      M.toast({html: 'You have casted your vote! Results will be announced soon! Thank you!'});
      return null;
      console.log('Transaction successfully committed!');
    }).catch((error) => {
      console.log('Transaction failed: ', error);
    });

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
            projectHTML(doc.id, doc.data(), index);
            index++;
            return null;
          });
        }).catch((error) => {
          console.log('error' + error);
          return error;
        });
  }

  function setModalID(event) {
    event.preventDefault();

    const projectID = event.path[4].id;

    let submitForm = document.getElementById('voteForm').elements;
    submitForm['projectID'].value = projectID;
  }


  /** Outputs data from DB to HTML
   * @param {string} docID
   * @param {docRef} docDATA
   * @param {int} index
   */
  function projectHTML(docID, docDATA, index) {
    let githubLink = '';
    if (docDATA.githubLink.length != 0) {
      githubLink = `<a href=${docDATA.githubLink}><i id="projectFeather" data-feather="github"></i></a>`;
    }

    const projName = `project${index}`;
    const projButton = `projectBtn${index}`;


    let div = document.createElement('div');
    div.className = 'row';
    div.style = 'text-align:center; padding-top:0px;';
    div.id = docID;

    console.log(docDATA);
    console.log(docDATA.imageURL);
    if (docDATA.imageURL === undefined) {
      if (docDATA.githubLink.length != 0) {
        githubLink = `<a href=${docDATA.githubLink} style="color:#ECEFF1;"><i id="projectFeather" data-feather="github"></i></a>`;
      }
      div.innerHTML = `<div class='card light-blue darken-1'>
        <div class='card-content white-text'>
          <a href="#confirmVote" id=${projButton} class='modal-trigger btn-floating halfway-fab waves-effect waves-light grey lighten-4'> <i class='material-icons' style="color: #039BE5"> add </i> </a>

          <span class="card-title" id="${projName}">${docDATA.name} </span>
          ${githubLink}
          <p>${docDATA.projectDisc}</p>
          <p>${docDATA.GCPDisc}</p>
        </div>
      </div>
      `;
    } else {
      div.innerHTML = `
        <div class="card">
          <div class="card-image">
            <img src=${docDATA.imageURL} alt='ProjectScreenshot'>
            <span class='card-title' id="${projName}">${docDATA.name}</span>
            <a href="#confirmVote" id=${projButton} class='modal-trigger btn-floating halfway-fab waves-effect waves light-blue darken-1'> <i class='material-icons'> add </i> </a>
          </div>
          <div class='card-content'>
            ${githubLink}
            <p>${docDATA.projectDisc}</p>
            <p>${docDATA.GCPDisc}</p>
          </div>
        </div>`;
    }


    if (index % 2 === 0) {
      $('#row1').append(div);
      // $('#row1').append('<div class="divider"></div>');
      feather.replace();
    } else {
      $('#row2').append(div);
      // $('#row2').append('<div class="divider"></div>');
      feather.replace();
    }

    let anchorButton = document.getElementById(projButton);
    anchorButton.addEventListener('click', setModalID);
  }

  // Event Listeners:
  // Shortcuts to DOM Elements:
  let signOutButtonElement = document.getElementById('logoutButton');
  let signInElement = document.getElementById('loginButton');
  let submitElement = document.getElementById('submitVote');

  // Saves message on form submit.
  signOutButtonElement.addEventListener('click', logoutUser);
  signInElement.addEventListener('click', loginUser);
  submitElement.addEventListener('click', submitVote);

  // initialize Firebase:
  authUser();
  displayProject();
});


