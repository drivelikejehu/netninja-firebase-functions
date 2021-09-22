const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate((user) => {
  // for background triggers you must return a value/promise
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
  });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});

// http callable functions (adding a request)
// data we send to the function, data from the front end when we add a request
// context contains information state of user aka user context
// when we do a callable function we need to return something to the client

exports.addRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can add requests'
    );
  }
  if (data.text.length > 30) {
    throw new functions.https.HttpsError(
        'invalid-argument',
        'requests must be no more than 30 characters long'
    );
  }
  admin.firestore().collection('requests').add({
    text: data.text,
    upVotes: 0,
  });
});
