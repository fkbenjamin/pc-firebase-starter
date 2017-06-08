/** TODO Remove dep, that are not needed anymore **/
import React from 'react';
import styles from "../style.css";
import {Bond} from 'oo7';
import {RRaisedButton, Rspan, TextBond, HashBond} from 'oo7-react';
import {bonds, formatBlockNumber, formatBalance, isNullData, makeContract} from 'oo7-parity';
import {TransactionProgressBadge, AccountIcon} from 'parity-reactive-ui';
import {List, ListItem} from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import SvgIconDone from 'material-ui/svg-icons/action/done';
import SvgIconWarning from 'material-ui/svg-icons/alert/warning';
import {blue300, indigo900, greenA200, red500, fullWhite} from 'material-ui/styles/colors';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
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
    this.newPass = {};
    //has to be updated to new contract
    this.contract = parity.bonds.makeContract('0xdbDcE1D614d7A6076eFde8540aA38f8e738c1e7a', abi.getPassABI());
    this.state = {
      tx: null,
      address: null,
      pass: null,
      bcpass: null,
      newPassHash: null
    };
    this.bcpass = this.contract.passByOwner(parity.bonds.me).then(a => {
      this.setState({bcpass: a})
    });
  }

  loadData() {
    var self = this;
    parity.bonds.me.then(snap => {
      this.setState({address: snap});
      firebase.database().ref('pass/' + snap).once('value').then(function(snapshot) {
        self.setState({pass: snapshot.val()});
      });
    });
  }
  changeValue(_field, _value){
    switch(_field){
      case 'code': {
        this.newPass.code = _value.target.value;
        break;
      }
      case 'givennames': {
        this.newPass.givennames = _value.target.value;
        break;
      }
      case 'eyes': {
        this.newPass.eyes = _value.target.value;
        break;
      }
      case 'height': {
        this.newPass.height = _value.target.value;
        break;
      }
      case 'name': {
        this.newPass.name = _value.target.value;
        break;
      }
      case 'nationality': {
        this.newPass.nationality = _value.target.value;
        break;
      }
      case 'passnr': {
        this.newPass.passnr = _value.target.value;
        break;
      }
      case 'pob': {
        this.newPass.pob = _value.target.value;
        break;
      }
      case 'residence': {
        this.newPass.residence = _value.target.value;
        break;
      }
      case 'sex': {
        this.newPass.sex = _value.target.value;
        break;
      }
      case 'type': {
        this.newPass.type = _value.target.value;
        break;
      }
      case 'dob': {
        this.newPass.dob = _value.target.value;
        break;
      }
    }
    this.hashPass();
  }
  hashPass() {
    this.setState({newPassHash: parity.api.util.sha3(
      this.newPass.code
      + this.newPass.givennames
      + this.newPass.eyes
      + this.newPass.height
      + this.newPass.name
      + this.newPass.nationality
      + this.newPass.passnr
      + this.newPass.pob
      + this.newPass.residence
      + this.newPass.sex
      + this.newPass.type
      + this.newPass.dob
      + this.state.url
     )});
  }
  uploadPass(){
    console.log('Uploading Pass');
    this.setState({tx: this.contract.updatePassport(parity.bonds.me, this.state.newPassHash, false)});
    fc.writePassData(this.state.address, this.newPass, this.state.newPassHash, this.state.url);
  }

  componentWillMount() {
    this.loadData();
  }

  render() {
    if (!this.state.address) {
      return (<img src="pass.png"/>);
    }
    if (!this.state.pass) {
      return (
        <div>
        <img src="pass.png"/>
        <h1>Passport Formular:
        </h1>
        <Paper zDepth={2}>
          <TextField hintText="Code"  underlineShow={false}   onChange={e => this.changeValue('code', e)}/>
          <Divider/>
          <TextField hintText="Date of Birth" underlineShow={false}  onChange={e => this.changeValue('dob', e)} />
          <Divider/>
          <TextField hintText="Colour of eyes" underlineShow={false}  onChange={e => this.changeValue('eyes', e)} />
          <Divider/>
          <TextField hintText="Given Names" underlineShow={false} onChange={e => this.changeValue('givennames', e)}/>
          <Divider/>
          <TextField hintText="Height" underlineShow={false} onChange={e => this.changeValue('height', e)}/>
          <Divider/>
          <TextField hintText="Name" underlineShow={false} onChange={e => this.changeValue('name', e)}/>
          <Divider/>
          <TextField hintText="Nationality" underlineShow={false} onChange={e => this.changeValue('nationality', e)}/>
          <Divider/>
          <TextField hintText="Passport Number" underlineShow={false} onChange={e => this.changeValue('passnr', e)}/>
          <Divider/>
          <TextField hintText="Place of Birth" underlineShow={false} onChange={e => this.changeValue('pob', e)}/>
          <Divider/>
          <TextField hintText="Residence" underlineShow={false} onChange={e => this.changeValue('residence', e)}/>
          <Divider/>
          <TextField hintText="Passport Type" underlineShow={false} onChange={e => this.changeValue('type', e)}/>
          <Divider/>
          <TextField hintText="Sex" underlineShow={false} onChange={e => this.changeValue('sex', e)}/>
          <Divider/>
          <TextField hintText="Hash" value={this.state.newPassHash ? this.state.newPassHash : ''} disabled={true} underlineShow={false}/>
        </Paper>

        <h1>Foto-Upload:</h1>
        <FileUploader accept="image/*" name="avatar" filename={fc.getAddress()} storageRef={firebase.storage().ref()} onUploadStart={fc.handleUploadStart} onUploadError={fc.handleUploadError} onUploadSuccess={fc.handleUploadSuccess.bind(this)} onProgress={fc.handleProgress}/>
        <br/>
        <img src={this.state.url}/>
        <RaisedButton
          backgroundColor="#a4c639"
          label="Submit your Pass"
          icon={<SvgIconDone/>} color={fullWhite}
          onTouchTap={this.uploadPass.bind(this)}
          />
          </div>
      );
    }
    if (!this.state.bcpass) {
      return (<img src="pass.png"/>);
    }
    /**if (this.state.pass.hash != this.state.bcpass[1]) {
      return (
        <h1>Warning! Someone changed your passport! Please call 110</h1>
      );
    }**/
    return (
      <div>
        <h1>{this.state.pass.name}</h1>
        <Card>
          <CardHeader title={this.state.pass.name} subtitle={this.state.pass.givennames} avatar={this.state.pass.imageUrl}/>
          <CardText>Typ/Type/Type {this.state.pass.type}
            Kode/Code/Code {this.state.pass.code}
            Pass-Nr./Passport No./Passeport No {this.state.pass.passnr}</CardText>
          <CardText>Staatsangehörigkeit/Nationality/Nationalité {this.state.pass.nationality}
            Geburtstag/Date of birth/Date de naissance {this.state.pass.dob}</CardText>
          <CardText>Geschlecht/Sex/Sexe {this.state.pass.sex}
            Geburtsort/Place of birth/Lieu de naissance {this.state.pass.pob}</CardText>
          <CardText>Wohnort/Residence/Domicile {this.state.pass.residence}
            Größe/Height/Taille {this.state.pass.height}
            Augenfarbe/Colour of eyes/Coleur des yeux {this.state.pass.eyes}
          </CardText>
          {this.state.bcpass[2]
            ? <Chip backgroundColor={greenA200} style={styles.chip}>
                <Avatar size={32} color="#444" backgroundColor={greenA200} icon={< SvgIconDone />}></Avatar>Passport is verified</Chip>
            : <Chip backgroundColor={red500} style={styles.chip}>
              <Avatar size={32} color="#444" backgroundColor={red500} icon={< SvgIconWarning />}></Avatar>Passport is not verified</Chip>}
        </Card>
      </div>
    );
  }
}
