
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

import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import {blue300, indigo900} from 'material-ui/styles/colors';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import * as firebase from 'firebase';
import {sha3_256} from 'js-sha3';
import FileUploader from 'react-firebase-file-uploader';
import {FireClass} from './fireclass.jsx';
import {ABI} from './ABI.jsx';

//Gui
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle'
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';


//Divider Gui
/*  <Paper zDepth={2}>
    <TextField hintText="First name" style={style} underlineShow={false} />
    <Divider />
    <TextField hintText="Middle name" style={style} underlineShow={false} />
    <Divider />
    <TextField hintText="Last name" style={style} underlineShow={false} />
    <Divider />
    <TextField hintText="Email address" style={style} underlineShow={false} />
    <Divider />
  </Paper>
);
export default DividerExampleForm;
*/

//creats new instant of FireClass, which handles all Firebase Stuff => see fireclass.jsx
const fc = new FireClass();
//loads Class of ABI's
const abi = new ABI();
const iconStyles = {
  marginRight: 24,
};

const FontIconExampleSimple = () => (
  <div>
    <FontIcon
      className="muidocs-icon-action-home"
      style={iconStyles}
    />

    <FontIcon
      className="muidocs-icon-action-home"
      style={iconStyles}
      color={blue500}
    />

    <FontIcon
      className="muidocs-icon-action-home"
      style={iconStyles}
      color={red500}
      hoverColor={greenA200}
    />
  </div>
);
export default FontIconExampleSimple;

const StylesOverridingInlineExample = () => (

//Overriding style
  <containerStyle
    name="StylesOverridingExample"
    style={{
      width: '50%',
      margin: '0 auto',
      border: '2px solid #FF9800',
      backgroundColor: '#ffd699',
    }}
  />
);


export class App extends React.Component {
  constructor() {
    super();
    //has to be updated to new contract
    this.contract = parity.bonds.makeContract('0x0AD24CEab0555599429ec755c8492Ae9B2c2Fe94', abi.getTestimonyABI());
    //remove, just here for reference how it is working
    this.tests = this.contract.savedTestimony();
    this.state = {
      tx: null,
      address: null,
      pass: null,
      expanded:false
      };
      var that = this;

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

/*
  handleReduce(){
    that.setState({expanded: false});
  }

  handleExpand(){
    that.setState({expanded: true});
  }
*/

  render() {


      if (!this.state.address) {
            return (<div />);
        }
      if (!this.state.pass) {
            return (<div />);
        }


      return (
      <div>
      <h1>{this.state.pass.name}</h1>


      <Card>
             <CardHeader
             title={this.state.pass.name}
             subtitle={this.state.pass.givennames}
             avatar={this.state.pass.imageUrl}
             showExpandableButton={true}
             actAsExpander={true}
             />

             <CardMedia
               expandable={true}
               overlay={<CardTitle title="Reni" subtitle="Peter Zwegat" />}
             >
               <img src={this.state.pass.imageUrl} alt="" />
             </CardMedia>

             <CardTitle title="Personal Data" expandable={true} />
             <CardText expandable={true}>
             <CardText>Typ/Type/Type:  {this.state.pass.type}         Kode/Code/Code: {this.state.pass.code}         Pass-Nr./Passport No./Passeport No:  {this.state.pass.passnr}</CardText>
             <CardText>1.Name/Surname/Nom: {this.state.pass.name}</CardText>
             <CardText>2.Vornamen/Given names/ Prénoms: {this.state.pass.givennames}</CardText>
             <CardText>3.Staatsangehörigkeit/Nationality/Nationalité: {this.state.pass.nationality}</CardText>
             <CardText>4.Geburtstag/Date of birth/Date de naissance:   {this.state.pass.dob}</CardText>
             <CardText>5.Geschlecht/Sex/Sexe:  {this.state.pass.sex}</CardText>
             <CardText>6.Geburtsort/Place of birth/Lieu de naissance:  {this.state.pass.pob}</CardText>
             <CardText>9.Behörde/Authority/Autorité: {this.state.pass.authority}</CardText>
             <CardText>11.Wohnort/Residence/Domicile:  {this.state.pass.residence}</CardText>
             <CardText>12.Größe/Height/Taille:  {this.state.pass.height}</CardText>
             <CardText>13.Augenfarbe/Colour of eyes/Coleur des yeux:  {this.state.pass.eyes} </CardText>

             <CardActions>
               <FlatButton label="Expand" onTouchTap ={this.handleExpand} disabled = {true}/>
               <FlatButton label="Reduce" onTouchTap ={this.handleReduce} primary = {true}/>
               <FontIcon className="muidocs-icon-action-home" style={iconStyles} />
             </CardActions>
             </CardText>

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
