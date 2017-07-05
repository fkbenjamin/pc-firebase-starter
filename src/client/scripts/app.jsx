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
import SvgIconCheckCircle from 'material-ui/svg-icons/action/check-circle';
import {blue300, indigo900, greenA200, red500, fullWhite, orange200, brown300, grey300, grey50} from 'material-ui/styles/colors';
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
import QRCode from 'qrcode.react';
import {FireClass} from './fireclass.jsx';
import {ABI} from './ABI.jsx';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import LinearProgress from 'material-ui/LinearProgress';
import Snackbar from 'material-ui/Snackbar';


//creats new instant of FireClass, which handles all Firebase Stuff => see fireclass.jsx
const fc = new FireClass();
//loads Class of ABI's
const abi = new ABI();
const paperStyle = {
  width: '70%',
  maxWidth: 1000,
  margin: 'auto',
  marginTop: 150,
  padding: 35
};
const qrcode = new QRCode();


const LinearProgressExampleSimple = () => (
  <LinearProgress mode="indeterminate" />
);

export class App extends React.Component {
  constructor() {
    super();
    this.bcpass = [];
    this.newPass = {};
    //has to be updated to new contract
    this.contract = parity.bonds.makeContract('0x51CC78d6fd5fd7076147Ac2b84Fb1FA0d7E53343', abi.getPassABI());
    this.countryCode = abi.getCountryCode();
    this.dataSourceConfig= {
      text: 'name',
      value: 'country-code'
    };
    this.state = {
      tx: null,
      address: null,
      pass: null,
      bcpass: null,
      bcvisa: null,
      newPassHash: null,
      open: false,
      entered: false,
      immigrationAddress: false,
      immigrationAddressOpened: false,
      embassy: false,
      institution: 1
    };

    this.bcpass = this.contract.passByOwner(parity.bonds.me).then(a => {
      this.setState({bcpass: a})
    });
    this.bcvisa = this.contract.visaByOwner(parity.bonds.me, 0).then(a => {
      this.setState({bcvisa: a});
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
    this.newPass[_field] = _value.target.value;
    this.hashPass();
  }
  changeInstitution(event, index, value){
    this.setState({institution: value});
  }

  hashPass() {
    // TODO: Is the picture included in this hash?
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
    this.setState({entered: true, userType: 'citizen', infoView:  true});
  }
  enterAppImmigration() {
    console.log('called');
    this.setState({entered: true, userType: 'immigration'});
  }
  enterAppEmbassy() {
    console.log('called');
    this.setState({entered: true, userType: 'embassy'});
  }
  enterAppCountry() {
    console.log('called');
    this.setState({entered: true, userType: 'country'});
  }


  componentWillMount() {
    this.loadData();
  }
  resetApp(){
    this.setState({tx: null,
    address: null,
    pass: null,
    bcpass: null,
    newPassHash: null,
    open: false,
    entered: false,
    immigrationAddress: false,
    immigrationAddressOpened: false,
    embassy: false});
    this.bcpass = this.contract.passByOwner(parity.bonds.me).then(a => {
      this.setState({bcpass: a})
    });
    this.loadData();
  }

  getCountryCode(chosenRequest, index){
      this.setState({countryCode:chosenRequest['country-code']});
  }

  render() {
    if (!this.state.entered) {
      return (
        <div>
          <div onClick={this.resetApp.bind(this)}>
            <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>

            <table cellSpacing='0' cellPadding='0' style={{margin: 'auto'}}>
            <tbody>
              <tr style={{height:365}}>
              <td style={{width:285 ,backgroundImage:'url(pass.png)'}}></td>
              <td style={{width:285,backgroundImage:'url(EmptyPass.png)'}}>
                <h1  style={{textAlign: "center"}}> Login as</h1>
              <RaisedButton label="citizen" backgroundColor={grey300} style={{
                display: 'block',
                margin: 20
              }} onTouchTap={this.enterAppCitizen.bind(this)}/>



              <RaisedButton label="immigration" backgroundColor={grey300} style={{
                display: 'block',
                margin: 20
              }} onTouchTap={this.enterAppImmigration.bind(this)}/>
              <RaisedButton label="embassy" backgroundColor={grey300} style={{
                display: 'block',
                margin: 20
              }} onTouchTap={this.enterAppEmbassy.bind(this)}/>
              <RaisedButton label="nation" backgroundColor={grey300} style={{
                display: 'block',
                margin: 20
              }} onTouchTap={this.enterAppCountry.bind(this)}/>
              </td>
              </tr>
              </tbody>
            </table>
          </Paper>
        </div>
      );
    }
    if (!this.state.address) {
      return (
        <div>
          <div onClick={this.resetApp.bind(this)}>
            <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
            <img src="pass.png"/>
          </Paper>
        </div>
      );
    }
    if (this.state.userType == 'immigration' && !this.state.immigrationAddressOpened) {
      return (
        <div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
            <h1>Scan QR-Code or enter Wallet-ID</h1>
            <Divider/>
            <TextField hintText="Wallet-ID" underlineShow={false} fullWidth={true} onChange={e => this.checkIfAddress(e)}/>
            <Divider/>
            <RaisedButton style={{
              marginTop: 15
            }} label="Check" fullWidth={true} disabled={!this.state.immigrationAddressIsAddress} onTouchTap={this.checkWalletPass.bind(this)} />
          </Paper>
          <Snackbar
            open={this.state.entered}
            message="You are now logged in as Immigration"
            autoHideDuration={4000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      );
    }

    if (this.state.userType == 'embassy') {
      return (
        <div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>

          <Paper style={paperStyle} zDepth={5}>
          <div>

</div>

          <Card>

          <LinearProgress mode="indeterminate" />
            <CardHeader

              title="Visum A1"
              subtitle="Transit"
              actAsExpander={true}
              showExpandableButton={true}
            />
            <CardActions>
              <FlatButton label="Modify" />
              <FlatButton label="Delete" />
            </CardActions>
            <CardText expandable={true}>
              Transit (C) visas are nonimmigrant visas for persons traveling in immediate and continuous transit
              through the United States en route to another country, with few exceptions. Immediate and continuous
              transit is defined as a reasonably expeditious departure of the traveler in the normal course of travel
              as the elements permit and assumes a prearranged itinerary without any unreasonable layover privileges.
            </CardText>
          </Card>
          <Card>
            <CardHeader
              title="Visum B1"
              subtitle="Social"
              actAsExpander={true}
              showExpandableButton={true}
            />
            <CardActions>
              <FlatButton label="Modify" />
              <FlatButton label="Delete" />
            </CardActions>
            <CardText expandable={true}>
            Social Cultural Visa is issued to travelers who intend to visit Indonesia for: Lecture, short Internship program,
            short Courses, Arts, Meetings, Volunteer Program, Sport Activities, visiting family and other related Social
            activities.
            Social Cultural Visa (Single or Multiple Entry Visa) will allow you a maximum stay of 60 (sixty) days for each visit. This type of visa can be extended at the Indonesian Immigration Office for 4 (four) times, with each extension for maximum 30 (thirty) days.
            </CardText>
          </Card>
          <Card>
            <CardHeader
              title="Visum C1"
              subtitle="Business Visitor"
              actAsExpander={true}
              showExpandableButton={true}
            />
            <CardActions>
              <FlatButton label="Modify" />
              <FlatButton label="Delete" />
            </CardActions>
            <CardText expandable={true}>
            If the purpose of the planned travel is business related, for example, to consult with business associates, attend a scienti c, educational, professional or business conference, settle an estate, or negotiate a contract, then a business visitor visa (B-1) would be the appropriate type of visa for the travel.            </CardText>
          </Card>
          </Paper>
          <Snackbar
            open={this.state.entered}
            message="You are now logged in as Embassy"
            autoHideDuration={4000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      );
    }

    if (this.state.userType == 'country') {
      return (
        <div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
            <h1>Add an institution </h1>
            <SelectField floatingLabelText="Institution" value={this.state.institution} onChange={this.changeInstitution.bind(this)}>
              <MenuItem value={1} primaryText="Embassy"/>
              <MenuItem value={2} primaryText="Immigration"/>
            </SelectField>
            <br />
            <Divider/>
            <TextField hintText="Wallet-ID" underlineShow={false} fullWidth={true} onChange={e => this.checkIfAddress(e)}/>
            <Divider/>
            <RaisedButton style={{
              marginTop: 15
            }} label="Submit" fullWidth={true} disabled={!this.state.immigrationAddressIsAddress} onTouchTap={this.checkWalletPass.bind(this)} />
          </Paper>
          <Snackbar
            open={this.state.entered}
            message="You are now logged in as Nation"
            autoHideDuration={4000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      );
    }

    if (this.state.userType == 'immigration' && this.state.immigrationAddressOpened) {
      return (
        <div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
          <h1>Passport of {this.state.pass.givennames} {this.state.pass.name}</h1>
            <table>
              <tbody>
                <tr>
                  <td>
                    <img style={{
                      maxWidth: '100%',
                      height: 'auto'
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

            <table>
            <tbody>
              <tr>
                <td colSpan='3'>
                  The blockchain passport:
                </td>
              </tr>
              <tr>
                <td rowSpan='2'>
                  <QRCode value={this.state.bcpass[0]} />
                </td>
                <td>
                  <DescText desc="Address" val={this.state.bcpass[0]} />
                </td>
                <td>
                {this.state.bcpass[2]
                  ? <Chip backgroundColor={greenA200} style={{
                      marginTop: 30
                    }}>
                      <Avatar size={32} color="#444" backgroundColor={greenA200} icon={< SvgIconDone />}></Avatar>Passport is verified</Chip>
                  : <Chip backgroundColor={red500} style={{
                    marginTop: 30
                  }}>
                    <Avatar size={32} color="#444" backgroundColor={red500} icon={< SvgIconWarning />}></Avatar>Passport is not verified</Chip>}
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <DescText desc="Hashed Pass" val={this.state.bcpass[1]} />
                </td>
              </tr>
            </tbody>
            </table>

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
      <Snackbar
        open={this.state.entered}
        message="You are now logged in as Immigration"
        autoHideDuration={4000}
        onRequestClose={this.handleRequestClose}
      />

    }
    if (!this.state.pass) {
      return (
        <div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
            <PassForm/>
          </Paper>
        </div>
      );
    }
    if (!this.state.bcpass) {
      return (  <div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div><img src="pass.png"/></div>);
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
        <div onClick={this.resetApp.bind(this)}>
          <Logo />
        </div>
        <Paper style={paperStyle} zDepth={5}>
        <h1>Your passport and visa</h1>
          <table>
            <tbody>
              <tr>
                <td>
                  <img style={{
                    'maxWidth': '100%',
                    'height': 'auto'
                  }} src={this.state.pass.imageUrl}/>
                </td>
                <td>
                  <table>
                    <tbody>
                      <tr>
                        <td >
                          <DescText desc='Typ/Type/Type' val={this.state.pass.type}/></td>
                        <td >
                          <DescText desc='Kode/Code/Code' val={this.state.pass.code}/></td>
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
          <table>
          <tbody>
            <tr>
              <td colSpan='3'>
                <h3>Your blockchain passport:</h3>
              </td>
            </tr>
            <tr>
              <td rowSpan='2'>
                <QRCode value={this.state.bcpass[0]} />
              </td>
              <td>
                <DescText desc="Address" val={this.state.bcpass[0]} />
              </td>
              <td>
              {this.state.bcpass[2]
                ? <Chip backgroundColor={greenA200} style={{
                    marginTop: 30
                  }}>
                    <Avatar size={32} color="#444" backgroundColor={greenA200} icon={< SvgIconDone />}></Avatar>Passport is verified</Chip>
                : <Chip backgroundColor={red500} style={{
                  marginTop: 30
                }}>
                  <Avatar size={32} color="#444" backgroundColor={red500} icon={< SvgIconWarning />}></Avatar>Passport is not verified</Chip>}
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <DescText desc="Hashed Pass" val={this.state.bcpass[1]} />
              </td>
            </tr>
          </tbody>
          </table>
          <Divider />
          <List>
            <Subheader>Your Visa</Subheader>
            <ListItem
              primaryText={this.state.bcvisa[2]}
              secondaryText={this.state.bcvisa[3] + '/' + this.state.bcvisa[4] + ' ETH'}
              leftAvatar={<AccountIcon
	                  style={{width: '2.5em'}}
	                  key='0x008aB18490E729bBea993817E0c2B3c19c877115'
	                  address='0x008aB18490E729bBea993817E0c2B3c19c877115'
                          />}
              rightIcon={<SvgIconCheckCircle/>}
            />
          </List>
          <Divider />


          <DialogExampleModal/>

        </Paper>

        <Snackbar
          open={this.state.entered}
          message="You are now logged in as Citizen"
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
        />

      </div>
      ); } }
      export class PassForm extends App {constructor() {
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
              <AutoComplete
              floatingLabelText ="Country"
              dataSource ={this.countryCode}
              dataSourceConfig={this.dataSourceConfig}
              onNewRequest = {this.getCountryCode.bind(this)}
              />
            </Dialog>
          </div>
        );
      }
}
export class Logo extends React.Component {
  constructor() {
    super();
  }
  render() {
    return(
      <img src="title.png" style={{position:'fixed', top:0, left:0, width: 190, height: 190}} />
  )}
}
