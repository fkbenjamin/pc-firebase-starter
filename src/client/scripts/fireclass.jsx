import React from 'react';
import * as firebase from 'firebase';
import FileUploader from 'react-firebase-file-uploader';

export class FireClass extends React.Component {
  constructor() {
    super();
    var config = {
      apiKey: "AIzaSyCTzP3QOo9sElx5bFXIu4L2B4r6-N-Oo4w",
      authDomain: "passchain-a11e5.firebaseapp.com",
      databaseURL: "https://passchain-a11e5.firebaseio.com",
      projectId: "passchain-a11e5",
      storageBucket: "passchain-a11e5.appspot.com",
      messagingSenderId: "481652628414"
    };
    firebase.initializeApp(config);

    //initialize firebaseDB
    const db = firebase.database();
  }
  //write Pass Data to DB. Remember to use parity.bonds.me.then() for walletID
  writePassData(walletId, type, code, passnr, name, givennames, nationality, dob, sex, pob, imageUrl, residence, height, eyes) {
    firebase.database().ref('pass/' + walletId).set({
      type: type,
      code: code,
      name: name,
      givennames: givennames,
      nationality: nationality,
      dob: dob,
      sex: sex,
      pob: pob,
      image: imageUrl,
      residence: residence,
      height: height,
      eyes: eyes
    });
  }
  //gets async call for user address for FileUploader
  getAddress() {
    var address = ''
    parity.bonds.me.then(add => {
      address = add
    });
    console.log(address);
    return address;
    //Upload started
  }
  handleUploadStart() {
    console.log('Started Upload');
  }
  //Progress of Upload
  handleProgress(progress) {
    console.log('Progress:' + progress);
  }
  //Progress Error
  handleUploadError(error) {
    console.error('Error while uploading:' + error);
  }
  //Upload succeeded
  handleUploadSuccess(filename) {
    console.log('Success uploading from own class');
    firebase.storage().ref().child(filename).getDownloadURL().then(function(url) {
      this.setState({url: url});
    }.bind(this));
  }
}
