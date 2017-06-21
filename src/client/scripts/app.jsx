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
import SvgIconAdd from 'material-ui/svg-icons/content/add-circle';
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
import Dialog from 'material-ui/Dialog';

//creats new instant of FireClass, which handles all Firebase Stuff => see fireclass.jsx
const fc = new FireClass();
//loads Class of ABI's
const abi = new ABI();
const paperStyle = {
  width: '70%',
  margin: 'auto',
  marginTop: 150,
  padding: 35
};

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
      newPassHash: null,
      open: false,
      entered: false,
      immigrationAddress: false,
      immigrationAddressOpened: false
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
  loadDataImmigration(_wallet) {
    var self = this;
    console.log('Loading Immigration Pass from Wallet: ' + _wallet);
    this.setState({address: _wallet});
    firebase.database().ref('pass/' + _wallet).once('value').then(function(snapshot) {
        self.setState({pass: snapshot.val(), immigrationAddressOpened: true});
      });
  }

  checkWalletPass(){
    console.log('something happens here');
    this.loadDataImmigration(this.state.immigrationAddress);
  }

  checkIfAddress(_value) {
    this.setState({
      immigrationAddress: _value.target.value,
      immigrationAddressIsAddress: parity.api.util.isAddressValid(_value.target.value)
    })

  }

  changeValue(_field, _value) {
    switch (_field) {
      case 'code':
        {
          this.newPass.code = _value.target.value;
          break;
        }
      case 'givennames':
        {
          this.newPass.givennames = _value.target.value;
          break;
        }
      case 'eyes':
        {
          this.newPass.eyes = _value.target.value;
          break;
        }
      case 'height':
        {
          this.newPass.height = _value.target.value;
          break;
        }
      case 'name':
        {
          this.newPass.name = _value.target.value;
          break;
        }
      case 'nationality':
        {
          this.newPass.nationality = _value.target.value;
          break;
        }
      case 'passnr':
        {
          this.newPass.passnr = _value.target.value;
          break;
        }
      case 'pob':
        {
          this.newPass.pob = _value.target.value;
          break;
        }
      case 'residence':
        {
          this.newPass.residence = _value.target.value;
          break;
        }
      case 'sex':
        {
          this.newPass.sex = _value.target.value;
          break;
        }
      case 'type':
        {
          this.newPass.type = _value.target.value;
          break;
        }
      case 'dob':
        {
          this.newPass.dob = _value.target.value;
          break;
        }
    }
    this.hashPass();
  }

  hashPass() {
    this.setState({
      newPassHash: parity.api.util.sha3(this.newPass.code + this.newPass.givennames + this.newPass.eyes + this.newPass.height + this.newPass.name + this.newPass.nationality + this.newPass.passnr + this.newPass.pob + this.newPass.residence + this.newPass.sex + this.newPass.type + this.newPass.dob + this.state.url)
    });
  }
  uploadPass() {
    console.log('Uploading Pass');
    this.setState({
      tx: this.contract.updatePassport(parity.bonds.me, this.state.newPassHash, false)
    });
    fc.writePassData(this.state.address, this.newPass, this.state.newPassHash, this.state.url);
  }

  enterAppCitizen() {
    console.log('called');
    this.setState({entered: true, userType: 'citizen'});
  }
  enterAppImmigration() {
    console.log('called');
    this.setState({entered: true, userType: 'immigration'});
  }

  componentWillMount() {
    this.loadData();
  }

  render() {
    if (!this.state.entered) {
      return (
        <Paper style={paperStyle} zDepth={5}>
          <img src="pass.png"/>
          <RaisedButton label="Enter as citizen" primary={true} style={{
            display: 'block',
            margin: 20
          }} onTouchTap={this.enterAppCitizen.bind(this)}/>
          <RaisedButton label="Enter as immigration" primary={true} style={{
            display: 'block',
            margin: 20
          }} onTouchTap={this.enterAppImmigration.bind(this)}/>
        </Paper>
      );
    }
    if (!this.state.address) {
      return (
        <div>
          <Paper style={paperStyle} zDepth={5}>
            <img src="pass.png"/>
          </Paper>
        </div>
      );
    }
    if (this.state.userType == 'immigration' && !this.state.immigrationAddressOpened) {
      return (
        <div>
          <Paper style={paperStyle} zDepth={5}>
            <h1>Scan QR-Code or enter Wallet-ID</h1>
            <Divider/>
            <TextField hintText="Wallet-ID" underlineShow={false} fullWidth={true} onChange={e => this.checkIfAddress(e)}/>
            <Divider/>
            <RaisedButton style={{
              marginTop: 15
            }} label="Check" fullWidth={true} disabled={!this.state.immigrationAddressIsAddress} onTouchTap={this.checkWalletPass.bind(this)} />
          </Paper>
        </div>
      );
    }
    if (this.state.userType == 'immigration' && this.state.immigrationAddressOpened) {
      return (
        <div>
          <Paper style={paperStyle} zDepth={5}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <img style={{
                      width: '100%',
                      height: '100%'
                    }} src={this.state.pass.imageUrl}/>
                  </td>
                  <td>
                    <table>
                      <tbody>
                        <tr>
                          <td >
                            <DescText desc='Typ/Type/Type' val={this.state.pass.type}/></td>
                          <td >
                            <DescText desc='CardText>Kode/Code/Code' val={this.state.pass.code}/></td>
                          <td >
                            <DescText desc='Pass-Nr./Passport No./Passeport No' val={this.state.pass.passnr}/></td>
                        </tr>
                        <tr>
                          <td>
                            <DescText desc='Name/Surname/Nom' val={this.state.pass.name}/></td>
                        </tr>
                        <tr>
                          <td>
                            <DescText desc='Vornamen/Given names/Prénoms' val={this.state.pass.givennames}/></td>
                        </tr>
                        <tr>
                          <td>
                            <DescText desc='Staatsangehörigkeit/Nationality/Nationalité' val={this.state.pass.nationality}/></td>
                          <td>
                            <DescText desc='Geburtstag/Date of birth/Date de naissance' val={this.state.pass.dob}/></td>
                        </tr>
                        <tr>
                          <td>
                            <DescText desc='Geschlecht/Sex/Sexe' val={this.state.pass.sex}/></td>
                          <td>
                            <DescText desc='Geburtsort/Place of birth/Lieu de naissance' val={this.state.pass.pob}/></td>
                        </tr>
                        <tr>
                          <td>
                            <DescText desc='Wohnort/Residence/Domicile' val={this.state.pass.residence}/></td>
                          <td>
                            <DescText desc='Größe/Height/Taille' val={this.state.pass.height}/></td>
                          <td>
                            <DescText desc='Augenfarbe/Colour of eyes/Coleur des yeux' val={this.state.pass.eyes}/></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            {this.state.bcpass[2]
              ? <Chip backgroundColor={greenA200} style={{
                  marginTop: 30
                }}>
                  <Avatar size={32} color="#444" backgroundColor={greenA200} icon={< SvgIconDone />}></Avatar>Passport is verified</Chip>
              : <Chip backgroundColor={red500} style={{
                marginTop: 30
              }}>
                <Avatar size={32} color="#444" backgroundColor={red500} icon={< SvgIconWarning />}></Avatar>Passport is not verified</Chip>}

            <table>
              <tbody>
                <tr>
                  <td>Here will be the country's Visa</td>
                </tr>
              </tbody>
            </table>
            <RaisedButton fullWidth={true} style={{
              marginTop: 15
            }} label="Stamp in"/>
            <RaisedButton fullWidth={true} style={{
              marginTop: 15
            }} label="Stamp out"/>
          </Paper>
        </div>
      );
    }
    if (!this.state.pass) {
      return (
        <div>
          <Paper style={paperStyle} zDepth={5}>
            <PassForm/>
          </Paper>
        </div>
      );
    }
    if (!this.state.bcpass) {
      return (<img src="pass.png"/>);
    }
    /**if (this.state.pass.hash != this.state.bcpass[1]) {
      return (
        <div>
        <Paper style={paperStyle} zDepth={5}>
        <ErrorMessage val='Warning! Someone changed your passport. Hashes are not matching anymore. Please contact us!'/>
        </Paper>
        </div>
      );
    }**/
    return (
      <div>
        <Paper style={paperStyle} zDepth={5}>
          <table>
            <tbody>
              <tr>
                <td>
                  <img style={{
                    width: '100%',
                    height: '100%'
                  }} src={this.state.pass.imageUrl}/>
                </td>
                <td>
                  <table>
                    <tbody>
                      <tr>
                        <td >
                          <DescText desc='Typ/Type/Type' val={this.state.pass.type}/></td>
                        <td >
                          <DescText desc='CardText>Kode/Code/Code' val={this.state.pass.code}/></td>
                        <td >
                          <DescText desc='Pass-Nr./Passport No./Passeport No' val={this.state.pass.passnr}/></td>
                      </tr>
                      <tr>
                        <td>
                          <DescText desc='Name/Surname/Nom' val={this.state.pass.name}/></td>
                      </tr>
                      <tr>
                        <td>
                          <DescText desc='Vornamen/Given names/Prénoms' val={this.state.pass.givennames}/></td>
                      </tr>
                      <tr>
                        <td>
                          <DescText desc='Staatsangehörigkeit/Nationality/Nationalité' val={this.state.pass.nationality}/></td>
                        <td>
                          <DescText desc='Geburtstag/Date of birth/Date de naissance' val={this.state.pass.dob}/></td>
                      </tr>
                      <tr>
                        <td>
                          <DescText desc='Geschlecht/Sex/Sexe' val={this.state.pass.sex}/></td>
                        <td>
                          <DescText desc='Geburtsort/Place of birth/Lieu de naissance' val={this.state.pass.pob}/></td>
                      </tr>
                      <tr>
                        <td>
                          <DescText desc='Wohnort/Residence/Domicile' val={this.state.pass.residence}/></td>
                        <td>
                          <DescText desc='Größe/Height/Taille' val={this.state.pass.height}/></td>
                        <td>
                          <DescText desc='Augenfarbe/Colour of eyes/Coleur des yeux' val={this.state.pass.eyes}/></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          {this.state.bcpass[2]
            ? <Chip backgroundColor={greenA200} style={{
                marginTop: 30
              }}>
                <Avatar size={32} color="#444" backgroundColor={greenA200} icon={< SvgIconDone />}></Avatar>Passport is verified</Chip>
            : <Chip backgroundColor={red500} style={{
              marginTop: 30
            }}>
              <Avatar size={32} color="#444" backgroundColor={red500} icon={< SvgIconWarning />}></Avatar>Passport is not verified</Chip>}

          <table>
            <tbody>
              <tr>
                <td>Here will be a/multiple Visa</td>
              </tr>
            </tbody>
          </table>

          <DialogExampleModal/>

        </Paper>
      </div>
      ); } } export class PassForm extends App {constructor() {
        super();
      }
      render() {
        return (
          <div>
            <table>
              <tbody>
                <tr>
                  <td>
                    <h1>Passport Formular:
                    </h1>
                    <TextField hintText="Code" underlineShow={false} onChange={e => this.changeValue('code', e)}/>
                    <Divider/>
                    <TextField hintText="Date of Birth" underlineShow={false} onChange={e => this.changeValue('dob', e)}/>
                    <Divider/>
                    <TextField hintText="Colour of eyes" underlineShow={false} onChange={e => this.changeValue('eyes', e)}/>
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
                    <TextField hintText="Hash" value={this.state.newPassHash
                      ? this.state.newPassHash
                      : ''} disabled={true} underlineShow={false}/>
                  </td>
                  <td>
                    <h2>Foto-Upload:</h2>
                    <FileUploader accept="image/*" name="avatar" filename={fc.getAddress()} storageRef={firebase.storage().ref()} onUploadStart={fc.handleUploadStart} onUploadError={fc.handleUploadError} onUploadSuccess={fc.handleUploadSuccess.bind(this)} onProgress={fc.handleProgress}/>
                    <img src={this.state.url}/>
                  </td>
                </tr>
              </tbody>
            </table>
            <RaisedButton backgroundColor="#a4c639" label="Submit your Pass" icon={< SvgIconDone />} color={fullWhite} onTouchTap={this.uploadPass.bind(this)}/>
          </div>
        );
      }
}

      //Descriptive Text of Pass
       export class DescText extends React.Component {
         render() {
        return (
          <CardText style={{
            fontWeight: 'bold'
          }}>
            <label style={{
              display: 'block',
              fontSize: 8,
              marginBottom: 5,
              fontWeight: 'normal'
            }}>{this.props.desc}</label>
            {this.props.val}
          </CardText>
        );
      }
}

      export class ErrorMessage extends React.Component {render() {
        return (
          <CardText style={{
            fontWeight: 'bold'
          }}>Error:{this.props.val}</CardText>
        );
      }
}

      export default class DialogExampleModal extends App {constructor() {
        super();
      }

      handleOpen() {
        this.setState({open: true});
      };

      handleClose() {
        this.setState({open: false});
      };

      render() {
        const actions = [ < FlatButton label = "Cancel" primary = {
            true
          }
          onTouchTap = {
            this.handleClose.bind(this)
          } />, < FlatButton label = "Submit" primary = {
            true
          }
          disabled = {
            true
          }
          onTouchTap = {
            this.handleClose.bind(this)
          } />
        ];

        return (
          <div>
            <RaisedButton backgroundColor="#a4c639" label="Add a Visa" icon={< SvgIconAdd />} color={fullWhite} fullWidth={true} onTouchTap={this.handleOpen.bind(this)}/>
            <Dialog title="Apply for a Visa" actions={actions} modal={true} open={this.state.open}>
              In this dialog there should be the Visa Application & Payment Process
            </Dialog>
          </div>
        );
      }
}
