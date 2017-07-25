/** TODO Remove dep, that are not needed anymore **/
import React from 'react';
import styles from "../style.css";
import {Bond} from 'oo7';
import {RRaisedButton, Rspan, TextBond, HashBond} from 'oo7-react';
import {bonds, formatBlockNumber, formatBalance, isNullData, makeContract} from 'oo7-parity';
import {TransactionProgressBadge, TransactionProgressLabel, AccountIcon, TransactButton} from 'parity-reactive-ui';
import {List, ListItem} from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Snackbar from 'material-ui/Snackbar';
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
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import LinearProgress from 'material-ui/LinearProgress';
import Checkbox from 'material-ui/Checkbox';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import QrReader from 'react-qr-reader';

import {FireClass} from './fireclass.jsx';
import {ABI} from './ABI.jsx';


//creats new instant of FireClass, which handles all Firebase Stuff => see fireclass.jsx
const fc = new FireClass();
//loads Class of ABI's => see ABI.jsx
const abi = new ABI();
const qrcode = new QRCode();

const paperStyle = {
  width: '70%',
  maxWidth: 1000,
  margin: 'auto',
  marginTop: 175,
  padding: 35
};
const previewStyle = {
  height: 450,
  width: '100%',
};
const backHeadingStyle = {
  position:'absolute',
  top:0,
  right:10,
  fontSize:130,
  fontWeight:'bold',
  textTransform:'uppercase',
  zIndex:-1,
  opacity:0.3,
};

const LinearProgressExampleSimple = () => (
  <LinearProgress mode="indeterminate" />
);

// Constants:
const COUNTRIES = [288,752,40,524]; // only these countries will be used for visa

// App:
export class App extends React.Component {
  constructor() {
    super();
    this.bcpass = [];
    this.newPass = {};
    this.newvisaoffering = {};

    //all contracts
    this.contract = parity.bonds.makeContract('0xca16D554f2974F32C16212c6C39e678dA958b50e', abi.getStorageABI()); // v0.6
    this.immigration = parity.bonds.makeContract('0x42Da049B7E5c7AAcF5506cE7198b1a7B23070C93', abi.getImmigrationABI()); //v0.8
    this.citizen = parity.bonds.makeContract('0x90f8092B9f6E596D8D2937c971D64B93f866dD80', abi.getCitizenABI()); // v0.4
    this.nation = parity.bonds.makeContract('0x75e0292B68FaADc14B4Ac64E7ED6D6A1b2706654', abi.getNationABI()); // v0.5
    this.embassy = parity.bonds.makeContract('0x13477Ff61aF4337434ACC1df74c31Dff68E368a5', abi.getEmbassyABI()); // v0.7
    this.nameresolver = parity.bonds.makeContract('0x53708Ea1EF858086Afcb2E063E5CA7CDF7EC9d76', abi.getNameresolverABI()); // v0.4

    this.countryCode = abi.getCountryCode();
    this.dataSourceConfig= {
      text: 'name',
      value: 'country-code'
    };

    // handle all other initialization routines in reset function
    this.resetApp();
  }

  // reset app to home screen
  resetApp(){
    this.state = {
      tx: null, // current transaction (and its status)
      address: null, // own parity address
      pass: null,  // firebase passport
      bcpass: null, // blockchain passport
      bcvisa: [], // blockchain visa
      bcvisaofferings: [],
      countryId: null, // own countryId or 0 (if not a country)
      newPassHash: null,
      open: false,
      snackOpen: false,
      entered: false,
      immigrationAddress: false,
      immigrationAddressOpened: false,
      embassy: false,
      institution: 1,
      enteredValidation: false,
      nationAddress: null,
      countryForVisa: null,
      chipData: [],
      newvisaoffering: []
    };

    // loads user's data
    this.loadData();
  }

  // loads user's data and populates this.state.address
  loadData() {
    var self = this;
    console.log('I am ' + this.state.address);
    parity.bonds.me.then(me => {
      console.log('I am ' + me);
      self.setState({address: me});

      firebase.database().ref('pass/' + me).once('value').then(function(snapshot) {
        self.setState({pass: snapshot.val()});
      });

      this.bcpass = this.contract.passByOwner(me).then(a => {
        this.setState({bcpass: a})
      });

      this.loadAllVisa(me);
    });

  }

  loadDataImmigration(_wallet) {
    console.log(`Immigration of country ${this.state.countryForVisa} loads ${_wallet}.`);
    //clear visa to avoid mixup of visa
    this.clearBcVisa();
    this.loadPass(_wallet);
    // TODO: get own country id
    this.loadVisa(_wallet, this.state.countryForVisa);
    // this.loadVisaOfferings(_country);
  }

  clearBcVisa() {
    this.setState({bcvisa: []});
  }

  // Populates this.state.bcpass
  loadPass(_wallet) {
    var self = this;
    firebase.database().ref('pass/' + _wallet).once('value').then(function(snapshot) {
      self.setState({address: _wallet});
      self.setState({pass: snapshot.val(), immigrationAddressOpened: true});
    });

    this.bcpass = this.contract.passByOwner(_wallet).then(a => {
      this.setState({bcpass: a});
    });
  }

  loadAllVisa(_wallet) {
    for (let c of COUNTRIES) {
      this.loadVisa(_wallet, c);
    }
  }

  // Populates this.state.bcvisa with loaded visa
  loadVisa(_wallet, _country) {
    // TODO: Make sure this is only called when needed not at every Single
    // view change.
    console.log(`Loading visa of ${_country} for `, _wallet);
      this.contract.visaLength(_wallet, _country).then(length => {
        console.log(`Found ${length} visa of ${_country} to load.`);
        for (let i = 0; i < length; i++) {
          this.contract.visaStore(_wallet, _country, i).then(visa => {
            let visatmp = this.state.bcvisa || [];
            visa.country = _country;
            visa.id = i;
            visatmp.push(visa);
            this.setState({bcvisa: visatmp});
            console.log(`Visa #${i}: ${visa}`);
          });
        }
      });
  }

  // Populates this.state.bcvisaofferings with loaded visaOfferings
  loadVisaOfferings(_country) {

    this.contract.visaOfferingsLength(_country).then(length => {
        console.log(`Found ${length} visaOfferings to load.`);
        for (let i = 0; i < length; i++) {
            this.contract.visaOfferings(_country, i).then(offer => {

                if (offer[1] != "") {
                  console.log(`Offer #${i}: ${offer}`);
                  let offertmp = this.state.bcvisaofferings || [];
                  offer.country = _country;
                  offer.id = i;
                  offertmp.push(offer);
                  this.setState({bcvisaofferings: offertmp});
                } else {
                  console.log(`Offer #${i}: ${offer} is empty.`);
                }
            });
        }
    });

  }

  checkWalletPass(){
    console.log('Checking Wallet Pass');
    this.loadDataImmigration(this.state.immigrationAddress);
    this.setState({enteredValidation: true});
  }

  // Called on scanning a qr code
  handleScan(data) {
    if(parity.api.util.isAddressValid(data)){
        console.log('scan', data);
        this.setState({
          immigrationAddress: data,
        })
        this.checkWalletPass();
    }
  }

  checkIfAddress(_value) {
    this.setState({
      immigrationAddress: _value.target.value,
      immigrationAddressIsAddress: parity.api.util.isAddressValid(_value.target.value)
    })
  }

  checkIfAddressForNationView(_value) {
    this.setState({
      nationAddress: _value.target.value,
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
    this.setState({
      newPassHash:  this.calcHashByPass(this.newPass),
    });
  }

  calcHashByPass(pass) {
    let str = "";
    str += pass.code || "";
    str += pass.givennames || "";
    str += pass.eyes || "";
    str += pass.height || "";
    str += pass.name || "";
    str += pass.nationality || "";
    str += pass.passnr || "";
    str += pass.pob || "";
    str += pass.residence || "";
    str += pass.sex || "";
    str += pass.type || "";
    str += pass.dob || "";
    str += pass.url || "";
    let hash = parity.api.util.sha3(str);
    console.log(str, str.length, hash);
    return hash;
  }

  uploadPass() {
    console.log('Uploading Pass');
    this.setState({tx: this.citizen.createPassport(this.state.countryCode, this.state.newPassHash)});
    let tx = this.citizen.createPassport(this.state.countryCode, this.state.newPassHash);
    console.log('after contract call');
    fc.writePassData(this.state.address, this.newPass, this.state.newPassHash, this.state.url);
    tx.done(s => this.checkTransaction(s).bind(this));
  }

  checkTransaction(s){
    console.log('arrived');
    if(s.confirmed.blockHash){
      this.loadData();
    }
  }

  enterAppCitizen() {
    console.log('entered as citizen');
    this.clearBcVisa();
    this.loadAllVisa(this.state.address);
    this.getFlag();
    this.setState({entered: true, userType: 'citizen', infoView:  true});
  }

  enterAppImmigration() {
    console.log('entered as immigration');
    this.immigration.immigrationOfCountry(parity.bonds.me).then(s => {
      console.log('Das ist in s:', s.c[0]);
      if(s.c[0]>0){
        this.setState({entered: true, userType: 'immigration', countryForVisa: s.c[0]});
      }
      else this.setState({snackOpen: true});
    });
  }

  enterAppEmbassy() {
    console.log('entered as embassy');
    this.embassy.embassiesOfCountry(parity.bonds.me).then(s => {
      console.log('Das ist in s:', s.c[0]);
      if(s.c[0]>0){
        this.loadVisaOfferings(s.c[0]);
        this.setState({entered: true, userType: 'embassy',countryForVisa: s.c[0]});
      }
      else this.setState({snackOpen: true});
    });
  }

  enterAppCountry() {
    console.log('entered as country');
    this.nation.countries(parity.bonds.me).then(s => {
      console.log('Das ist in s:', s.c[0]);
      if(s.c[0]>0){
        this.setState({entered: true, userType: 'country',countryForVisa: s.c[0]});
      }
      else this.setState({snackOpen: true});
    });
  }

  //generates alpha-2 country code from numeric country code
  getFlag() {
    for(var i = 0; i < this.countryCode.length; i++){
      if(this.countryCode[i]["country-code"] == this.state.bcpass[1]) {
        this.alpha = this.countryCode[i]["alpha-2"];
      }
    }
  }

  getFlagImmigration() {
    console.log('Getting immigration flag');
    for(var i = 0; i < this.countryCode.length; i++){
      if(this.countryCode[i]["country-code"] == this.state.bcpass[1].c[0]) {
        this.alpha = this.countryCode[i]["alpha-2"];
      }
    }
  }

  getAlpha(country) {
    for(var i = 0; i < this.countryCode.length; i++){
      if(this.countryCode[i]["country-code"] == country) {
        return this.countryCode[i]["alpha-2"];
      }
    }
  }

  stampIn(visa) {
    let owner = this.state.immigrationAddress;
    let country = visa.country;
    let visaId = visa.id;

    console.log('stampin', owner, country, visaId);
    this.setState({tx: this.immigration.stampIn( owner, country, visaId).then(this.stamped)});
  }
  stampOut(visa) {
    let owner = this.state.immigrationAddress;
    let country = visa.country;
    let visaId = visa.id;

    console.log('stampOut', owner, country, visaId);
    this.setState({tx: this.immigration.stampOut(owner, country, visaId).then(this.stamped)});
  }
  stamped(ele) {
    console.log('stamped this', this);
    console.log('stamped ele', ele);
  }

  verifyPassport() {
    console.log(this.state.immigrationAddress);
    console.log(this.state.pass.hash);
    let tx = this.embassy.verifyPass(this.state.immigrationAddress);
    tx.done(t => this.checkTransaction(t).bind(this));
    this.setState({tx: tx});
  }

  addFromNation() {
    switch(this.state.institution) {
      case 1:
        this.setState({tx: this.nation.addEmbassy(this.state.nationAddress)});
        break;
      case 2:
        this.setState({tx: this.nation.addImmigration(this.state.nationAddress)});
        break;
      default:
        console.log('ERROR while adding a institution');
        break;
    }
  }

  getCountryCode(chosenRequest, index){
    this.setState({countryCode:chosenRequest['country-code']});
    this.clearVisaOfferings();
    this.loadVisaOfferings(chosenRequest['country-code']);
  }

  deleteBcVisaOffering(index){
    this.embassy.deleteVisaOffering(this.state.countryForVisa, index);
    console.log('Button was pressed', index);
  }

  clearVisaOfferings() {
    this.setState({bcvisaofferings: []});
  }

  //here you pay for your visa
  payForBCVisa(visa){
    let dataString = 'payVisa(';
    dataString += visa.country + ', ' + visa.id + ')';
    //parity.bonds.post({to:0x90f8092B9f6E596D8D2937c971D64B93f866dD80, value: 0.04 * 1e15});
    this.citizen.payVisa(visa.country, visa.id, {value:visa[2]-visa[1]});
  }

  hashToReadable(hash) {
    return hash.slice(0,7) + '...' + hash.slice(-4);
  }

  handleError(err){
    console.error(err)
  }

  // called by react as soon as components are available
  componentWillMount() {
    // nothing
  }

  render() {
    document.body.style.backgroundColor = "#bd4e4b";
    // Welcome Page
    if (!this.state.entered) {
      return (
        <div>
          <div style={backHeadingStyle}>
            Home
          </div>
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
          <Snackbar
          open={this.state.snackOpen}
          message="Your PassChain-ID does not have access to that view"
          autoHideDuration={3000}
        />
        </div>
      );
    }
    // No connection to Parity
    if (!this.state.address) {
      console.log(`Unknown state ${this.state.userType} and address not set ${this.state.address}. Please debug.`);
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
    // Logged in as immigration but hasn't opened a passport
    if (this.state.userType == 'immigration' && !this.state.immigrationAddressOpened) {
      document.body.style.backgroundColor = "#2E6F72";
      return (
        <div>
        <div style={backHeadingStyle}>
          Immigration
        </div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
            <h1>Scan QR-Code or enter PassChain-ID</h1>
            <Divider/>
            <QrReader
              style={previewStyle}
              onError={this.handleError.bind(this)}
              onScan={this.handleScan.bind(this)}
            />
         <Divider/>
            <TextField hintText="PassChain-ID" underlineShow={false} fullWidth={true} onChange={e => this.checkIfAddress(e)}/>
            <Divider/>
            <RaisedButton style={{marginTop: 15}}
                          label="Check"
                          fullWidth={true}
                          disabled={!this.state.immigrationAddressIsAddress}
                          onTouchTap={this.checkWalletPass.bind(this)} />
          </Paper>
        </div>
      );
    }
    // Logged in as embassy
    if (this.state.userType == 'embassy' && !this.state.enteredValidation) {
      document.body.style.backgroundColor = "#BD804B";
      return (
        <div>
          <div style={backHeadingStyle}>
            Embassy
          </div>
          <div onClick={this.resetApp.bind(this)}>
            <Logo />
          </div>

          <Paper style={{width: '70%',
                        maxWidth: 1000,
                        margin: 'auto',
                        marginTop: 150,
                        }} zDepth={5}>
            <div>
              <Tabs value={this.state.value}  tabItemContainerStyle={{backgroundColor:"#bd4e4b", width:'100%' }} inkBarStyle={{backgroundColor: 'indigo900'}} onChange={this.handleChange}>
                <Tab label="Offerings" value="a">
                  <div style={{padding: 35}}>
                  <List>
                  {console.log('Debugging for Embassy', this.state.bcvisaofferings.length)}
                  {this.state.bcvisaofferings.length == 0
                    ? <h3>Your country has no Visa offerings yet.</h3>
                    : this.state.bcvisaofferings.map((offering, index) =>
                      <ListItem
                        primaryText={offering[1]}
                        secondaryText={"Price: [" + offering[4]/100000000000000000 + "] ETH. - " + offering[2]}
                        leftAvatar={<AccountIcon
                                style={{width: '2.5em'}}
                                key='0x008aB18490E729bBea993817E0c2B3c19c877115'
                                address='0x008aB18490E729bBea993817E0c2B3c19c877115'
                        />}
                        rightIcon={<RaisedButton
                                backgroundColor="#bd4e4b"
                                label={"Delete"}
                                color={fullWhite}
                                onTouchTap={this.deleteBcVisaOffering.bind(this, offering.id)}
                        />}
                      />)
                  }
                  </List>
                  <DialogExampleModal2 loadVisaOfferings={this.loadVisaOfferings} clearVisaOfferings={this.clearVisaOfferings}/>

                  </div>
                </Tab>
                <Tab label="Validate Pass" value="b">
                  <div style={{padding: 35}}>
                    <h1>Scan QR-Code or enter PassChain-ID</h1>
                    <Divider />
                    <QrReader
                      style={previewStyle}
                      onError={this.handleError.bind(this)}
                      onScan={this.handleScan.bind(this)}
                      />
                    <Divider />
                    <TextField hintText="PassChain-ID" underlineShow={false} fullWidth={true} onChange={e => this.checkIfAddress(e)}/>
                    <Divider />
                    <RaisedButton
                      style={{marginTop: 15}}
                      label="Open"
                      fullWidth={true}
                      disabled={!this.state.immigrationAddressIsAddress}
                      onTouchTap={this.checkWalletPass.bind(this)}
                      />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Paper>
        </div>
      );
    }
    // Logged in as embassy and has opened a passport
    if (this.state.userType == 'embassy' && this.state.enteredValidation) {
      document.body.style.backgroundColor = "#BD804B";
      return (

        <div>
        <div style={backHeadingStyle}>
          Embassy
        </div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>

          <Paper style={paperStyle} zDepth={5}>
          <div>
          <Tabs
                 value={this.state.value}
                 onChange={this.handleChange}
               >
                 <Tab label="Offerings" value="a">

                 <div>
                 <Card>
                 <DialogExampleModal2/>
                 <LinearProgress mode="indeterminate" />
                   <CardHeader
                     title="Visum A1"
                     subtitle="Transit"
                     actAsExpander={true}
                     showExpandableButton={true}
                   />
                   <CardActions>
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


                 </div>


                 </Tab>
                 <Tab label="Validate Pass" value="b">
                   <div>
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
                         <h3>QR-Code and Blockchain Details:</h3>
                         </td>
                       </tr>
                       <tr>
                         <td rowSpan='2'>
                           <QRCode value={this.state.bcpass[0]} />
                         </td>
                         <td>
                           <DescText desc="PassChain-ID" val={this.state.bcpass[0]} />
                         </td>
                         <td>
                         {this.state.bcpass[3]
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
                           <DescText desc="Hashed Pass" val={this.state.bcpass[2]} />
                         </td>
                       </tr>
                     </tbody>
                     </table>


                     <RaisedButton fullWidth={true} backgroundColor="#a4c639" style={{
                       marginTop: 15
                     }} label="Verify Passport" onTouchTap={this.verifyPassport.bind(this)}/>
                       <TransactionProgressBadge value={this.state.tx}/>
                       </div>
                 </Tab>
               </Tabs>
              </div>
          </Paper>
        </div>
      );
    }
    // Logged in as nation
    if (this.state.userType == 'country') {
      document.body.style.backgroundColor = "#3B4E7F";

      return (
        <div>
        <div style={backHeadingStyle}>
          Nation
        </div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
            <h1>Activate a PassChain-ID as institution</h1>
            <SelectField floatingLabelText="Institution" value={this.state.institution} onChange={this.changeInstitution.bind(this)}>
              <MenuItem value={1} primaryText="Embassy"/>
              <MenuItem value={2} primaryText="Immigration"/>
            </SelectField>
            <br />
            <Divider/>
            <TextField hintText="Enter PassChain-ID here" underlineShow={false} fullWidth={true} onChange={e => this.checkIfAddressForNationView(e)}/>
            <Divider/>

            <RaisedButton style={{
              marginTop: 15
            }} label="Nominate" fullWidth={true} disabled={!this.state.immigrationAddressIsAddress} onTouchTap={this.addFromNation.bind(this)} />
            <TransactionProgressBadge value={this.state.tx}/>
          </Paper>
        </div>
      );
    }
    // Logged in as immigration and has opened a passport
    if (this.state.userType == 'immigration' && this.state.immigrationAddressOpened) {
      document.body.style.backgroundColor = "#2E6F72";
      console.log('Whats the bcpass?', this.state.bcpass);
      this.getFlagImmigration();
      return (
        <div>
        <div style={backHeadingStyle}>
          Immigration
        </div>
          <div onClick={this.resetApp.bind(this)}>
            <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
            <div>
              <h1 style={{float:'left'}}>
                Passport of {this.state.pass.givennames} {this.state.pass.name}
              </h1>
              <div style={{float:'right'}}>
                <img src={"flags/" + this.alpha + ".png"}/>
              </div>
            </div>
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
                  <h3>QR-Code and Blockchain Details:</h3>
                </td>
              </tr>
              <tr>
                <td rowSpan='2'>
                  <QRCode value={this.state.bcpass[0]} />
                </td>
                <td>
                  <DescText desc="PassChain-ID" val={this.state.bcpass[0]} />
                </td>
                <td>
                {this.state.bcpass[3]
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
                  <DescText desc="Hashed Pass" val={this.state.bcpass[2]} />
                </td>
              </tr>
            </tbody>
            </table>

            <List>
              <Subheader>Your Visa</Subheader>
              {console.log('So sieht das Visa aus:', this.state.bcvisa)}
              {this.state.bcvisa.length == 0 ?
                <h3>This user doesnt have any visa yet.</h3>
              : this.state.bcvisa.map(visa =>
                  <ListItem
                  primaryText={visa[0]}
                  secondaryText={visa[1]/100000000000000000 + '/' + visa[2]/100000000000000000 + ' ETH'}
                  leftAvatar={<img style={{height:30, width:40}} src={"flags/" + this.getAlpha(visa.country) + ".png"}/>}
                  rightIcon={
                    visa[2] - visa[1] <= 0
                    ? visa[3] == 0
                    ? <RaisedButton style={{marginTop: 15, minWidth:100}} label="Stamp in" onTouchTap={this.stampIn.bind(this, visa)}/>
                    : <RaisedButton style={{marginTop: 15, minWidth:100}} label="Stamp out" onTouchTap={this.stampOut.bind(this, visa)}/>
                    : <SvgIconWarning/>}
                  />)
              }
            </List>
            <TransactionProgressBadge value={this.state.tx}/>
          </Paper>
        </div>
      );

    }
    // Enter a new pass
    if (!this.state.pass) {
      return (
        <div>
        <div style={backHeadingStyle}>
          Citizen
        </div>
          <div onClick={this.resetApp.bind(this)}>
          <Logo />
          </div>
          <Paper style={paperStyle} zDepth={5}>
          <div>
            <table>
              <tbody>
                <tr>
                  <td>
                    <h1>Passport Formular:
                    </h1>
                    <AutoComplete
                    floatingLabelText ="Country"
                    dataSource ={this.countryCode}
                    dataSourceConfig={this.dataSourceConfig}
                    onNewRequest = {this.getCountryCode.bind(this)}
                    />
                    <Divider/>
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
                    <h2>Picture-Upload:</h2>
                    <FileUploader accept="image/*" name="avatar" filename={fc.getAddress()} storageRef={firebase.storage().ref()} onUploadStart={fc.handleUploadStart} onUploadError={fc.handleUploadError} onUploadSuccess={fc.handleUploadSuccess.bind(this)} onProgress={fc.handleProgress}/>
                    <img src={this.state.url}/>
                  </td>
                </tr>
              </tbody>
            </table>
            <RaisedButton backgroundColor="#a4c639" label="Submit your Pass" icon={< SvgIconDone />} color={fullWhite} onTouchTap={this.uploadPass.bind(this)}/>
	          <TransactionProgressBadge value={this.state.tx}/>
          </div>
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
    // Show own pass
    return (
      <div>
      <div style={backHeadingStyle}>
        Citizen
      </div>
        <div onClick={this.resetApp.bind(this)}>
          <Logo />
        </div>
        <Paper style={paperStyle} zDepth={5}>
          <div>
            <h1 style={{float:'left'}}>
              Your Passport and Visa
            </h1>
            <div style={{float:'right'}}>
              <img src={"flags/" + this.alpha + ".png"}/>
            </div>
          </div>
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
                <h3>Personal QR-Code and Blockchain Details:</h3>
              </td>
            </tr>
            <tr>
              <td rowSpan='2'>
                <QRCode value={this.state.bcpass[0]} />
              </td>
              <td>
                <DescText desc="PassChain-ID" val={this.state.bcpass[0]} />
              </td>
              <td>
              {this.state.bcpass[3]
                ? <Chip backgroundColor={greenA200} style={{
                    marginTop: 30
                  }}>
                    <Avatar size={32} color="#444" backgroundColor={greenA200} icon={< SvgIconDone />}></Avatar>Passport is verified</Chip>
                : <Chip backgroundColor={red500} style={{
                  marginTop: 30
                }}>
                  <Avatar size={32} color="#444" backgroundColor={red500} icon={< SvgIconWarning />}></Avatar>Passport is not verified</Chip>
                }
              {this.state.pass.hash == this.state.bcpass[2]
                ? <Chip backgroundColor={greenA200} style={{marginTop: 30}}>
                  <Avatar size={32} color="#444" backgroundColor={greenA200} icon={< SvgIconDone />}></Avatar>Hashes match</Chip>
                : <Chip backgroundColor={red500} style={{marginTop: 30}}>
                  <Avatar size={32} color="#444" backgroundColor={red500} icon={< SvgIconWarning />}></Avatar>Hashes don't match</Chip>
              }
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <DescText desc='Hash of Passport Data' val={this.state.pass.hash}/>
                <DescText desc="Saved Hash in Blockchain" val={this.state.bcpass[2]} />
              </td>
            </tr>
          </tbody>
          </table>
          <Divider />
          <List>
            <Subheader>Your Visa</Subheader>
            {this.state.bcvisa.length == 0 ?
              <h3>You dont have any visa yet.</h3>
            : this.state.bcvisa.map(visa => <ListItem
              primaryText={visa[0]}
              secondaryText={visa[1]/100000000000000000 + '/' + visa[2]/100000000000000000 + ' ETH'}
              leftAvatar={<img style={{height:30, width:40}} src={"flags/" + this.getAlpha(visa.country) + ".png"}/>}
              rightIcon={visa[2] - visa [1] <= 0 ? <SvgIconCheckCircle/> : <RaisedButton backgroundColor="#a4c639" label={"Pay"} color={fullWhite} onTouchTap={this.payForBCVisa.bind(this, visa)}/> }
            /> )}
          </List>
          <Divider />
          <DialogExampleModal/>

        </Paper>
      </div>
      ); } }

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

export class DialogExampleModal2 extends App {
  constructor() {
  super();
  this.arrayEqualizer = 1;
  this.styles = {
    chip: {
      margin: 4,
    },
    wrapper: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  };
}

handleOpen() {
  this.setState({open: true});
};

handleClose() {
  this.setState({open: false});
};
handleKeyPress(e) {
  if(e.key === 'Enter'){
    this.chipData = this.state.chipData;
    var newLabel = {key: this.chipData.length + this.arrayEqualizer, label: e.target.value};
    this.chipData.push(newLabel);
    this.setState({chipData: this.chipData});
    console.log(this.state.chipData);
    this.refs.cond.input.value = '';
  }
}
handleRequestDelete (key) {

  this.chipData = this.state.chipData;
  const chipToDelete = this.chipData.map((chip) => chip.key).indexOf(key);
  this.chipData.splice(chipToDelete, 1);
  this.setState({chipData: this.chipData});
  this.arrayEqualizer++;
};

renderChip(data) {
  console.log(data);
  return (
    <Chip
      key={data.key}
      onRequestDelete={() => this.handleRequestDelete(data.key)}
      style={this.styles.chip}
    >
      {data.label}
    </Chip>
  );
}

addNewVisaOffering(){
  console.log(this.newvisaoffering);
  this.embassy.embassiesOfCountry(parity.bonds.me).then( s => {
    let tx = this.embassy.createVisaOffering(s.c[0], this.newvisaoffering.identifier, this.newvisaoffering.description, parseInt(this.newvisaoffering.validity), parseInt(this.newvisaoffering.price), this.newvisaoffering.conditions);
    console.log(tx);
    tx.done(t => {this.handleClose(); this.props.clearVisaOfferings(); this.props.loadVisaOfferings(s.c[0])});
    this.setState({tx: tx});
  });




}
changeOffering(_field, _value) {
  this.newvisaoffering[_field] = _value.target.value;
}

render() {
  const actions = [ < FlatButton label = "Cancel" primary = {
      true
    }
    onTouchTap = {
      this.handleClose.bind(this)
    } />, < FlatButton label = "Submit" primary = {
      true
    }
    onTouchTap = {
      this.addNewVisaOffering.bind(this)
    } />
  ];

  return (
    <div>
    <RaisedButton backgroundColor="#a4c639" label="Add a Visa Offering" icon={< SvgIconAdd />} color={fullWhite} fullWidth={true} onTouchTap={this.handleOpen.bind(this)}/>
      <Dialog title="Add a new Visa Offering" actions={actions} modal={true} open={this.state.open}>

               <div>
                <TextField hintText="Name of Visa" fullWidth={true} onChange={e => this.changeOffering('identifier', e)}  underlineShow={false} />
                <Divider/>
                <TextField hintText="Short Description" underlineShow={false} onChange={e => this.changeOffering('description', e)} fullWidth={true} />
                <Divider/>
                <TextField hintText="Conditions" fullWidth={true} onChange={e => this.changeOffering('conditions', e)} underlineShow={false}/>
                <Divider/>
                <TextField hintText="Price in ETH" fullWidth={true} onChange={e => this.changeOffering('price', e)} underlineShow={false} />
                <Divider/>
                <TextField hintText="Validity in Seconds" fullWidth={true} onChange={e => this.changeOffering('validity', e)}  underlineShow={false} />
                <Divider/>
                <TransactionProgressBadge value={this.state.tx} />
               </div>
      </Dialog>
    </div>
  );
}
}


      export class DialogExampleModal extends App {constructor() {
        super();
      }

      handleOpen() {
        this.setState({open: true});
      };

      handleClose() {
        this.setState({open: false});
      };
      applyForBcVisa(index){
        this.citizen.applyForVisa(this.state.countryCode, index);
        console.log('Button was pressed', index);
      }

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
            <Dialog style={{minHeight: 700, minWidth: 1200}} title="Apply for a Visa" actions={actions} modal={true} open={this.state.open}>
              <AutoComplete
              floatingLabelText ="Country"
              dataSource ={this.countryCode}
              dataSourceConfig={this.dataSourceConfig}
              onNewRequest = {this.getCountryCode.bind(this)}
              />
              <List>
              {
                this.state.bcvisaofferings.length == 0
                ? <h3>This country has no Visa offerings yet or you have not selected a country</h3>
                : this.state.bcvisaofferings.map((offering, index) =>
                  <ListItem
                    primaryText={offering[1]}
                    secondaryText={"Price: [" + offering[4]/100000000000000000 + "] ETH. - " + offering[2]}
                    leftAvatar={<AccountIcon
                            style={{width: '2.5em'}}
                            key='0x008aB18490E729bBea993817E0c2B3c19c877115'
                            address='0x008aB18490E729bBea993817E0c2B3c19c877115'
                    />}
                    rightIcon={<RaisedButton
                            backgroundColor="#a4c639"
                            label={"Apply"}
                            color={fullWhite}
                            onTouchTap={this.applyForBcVisa.bind(this, offering.id)}
                    />}
                  />)
              }
              </List>
            <TransactionProgressBadge value={this.state.tx} />
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
