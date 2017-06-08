
/** TODO Remove dep, that are not needed anymore **/
import React from 'react';
import styles from "../style.css";
import {Bond} from 'oo7';
import {RRaisedButton, Rspan, TextBond, HashBond} from 'oo7-react';
import {bonds,formatBlockNumber, formatBalance, isNullData, makeContract} from 'oo7-parity';
import {TransactionProgressBadge, AccountIcon} from 'parity-reactive-ui';
import {List, ListItem} from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import {blue300, indigo900} from 'material-ui/styles/colors';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import * as firebase from 'firebase';
import {sha3_256} from 'js-sha3';
import FileUploader from 'react-firebase-file-uploader';
import {FireClass} from './fireclass.jsx';
import {ABI} from './ABI.jsx';

//creats new instant of FireClass, which handles all Firebase Stuff => see fireclass.jsx
const fc = new FireClass();
//loads Class of ABI's
const abi = new ABI();

export class App extends React.Component {
  constructor() {
    super();
    this.bcpass = [];
    //has to be updated to new contract
    this.contract = parity.bonds.makeContract('0xdbDcE1D614d7A6076eFde8540aA38f8e738c1e7a', abi.getPassABI());
    this.state = {
      tx: null,
      address: null,
      pass: null,
      bcpass: null
      };
    this.bcpass = this.contract.passByOwner(parity.bonds.me).then(a => {this.setState({bcpass: a})});
  }

  loadData() {
    var self = this;
    parity.bonds.me.then(snap => {
      this.setState({
        address: snap
      });
      firebase.database().ref('pass/' + snap).once('value').then(function(snapshot) {
        self.setState({
          pass: snapshot.val()
        });
      });
    });
  }

  componentWillMount() {
    this.loadData();
  }

  render() {
      if (!this.state.address) {
            return (<img src="pass.png" />);
        }
      if (!this.state.pass) {
            return (<img src="pass.png" />);
        }
      if (!this.state.bcpass) {
            return (<img src="pass.png" />);
        }
      return (
      <div>
      <h1>{this.state.pass.name}</h1>
      <Card>
        <CardHeader title={this.state.pass.name} subtitle={this.state.pass.givennames} avatar={this.state.pass.imageUrl}/>
        <CardText>Typ/Type/Type {this.state.pass.type}        Kode/Code/Code {this.state.pass.code}       Pass-Nr./Passport No./Passeport No {this.state.pass.passnr}</CardText>
        <CardText>Staatsangehörigkeit/Nationality/Nationalité {this.state.pass.nationality}      Geburtstag/Date of birth/Date de naissance  {this.state.pass.dob}</CardText>
        <CardText>Geschlecht/Sex/Sexe {this.state.pass.sex}      Geburtsort/Place of birth/Lieu de naissance {this.state.pass.pob}</CardText>
        <CardText>Wohnort/Residence/Domicile {this.state.pass.residence}     Größe/Height/Taille {this.state.pass.height}     Augenfarbe/Colour of eyes/Coleur des yeux {this.state.pass.eyes} </CardText>
        <CardText>The Passport is <b>{this.state.bcpass[2] ? '' : 'not'}</b> verified. </CardText>
      </Card>


      <FileUploader
            accept="image/*"
            name="avatar"
            filename= {fc.getAddress()}
            storageRef={firebase.storage().ref()}
            onUploadStart={fc.handleUploadStart}
            onUploadError={fc.handleUploadError}
            onUploadSuccess={fc.handleUploadSuccess.bind(this)}
            onProgress={fc.handleProgress}
          />
       <img src={this.state.url} />
      </div>
    );
  }
}
