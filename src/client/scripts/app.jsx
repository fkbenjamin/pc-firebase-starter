/** TODO Remove dep, that are not needed anymore **/
import React from 'react';
import styles from "../style.css";
import {Bond} from 'oo7';
import {RRaisedButton, Rspan, TextBond, HashBond} from 'oo7-react';
import {formatBlockNumber, formatBalance, isNullData, makeContract} from 'oo7-parity';
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

//config for firebaseDB
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

//load contractABI
const TestimonyABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "lookup",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "type": "function"
  }, {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "isValid",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  }, {
    "constant": false,
    "inputs": [
      {
        "name": "hash",
        "type": "bytes32"
      }
    ],
    "name": "create",
    "outputs": [],
    "payable": false,
    "type": "function"
  }, {
    "constant": false,
    "inputs": [
      {
        "name": "testimonyID",
        "type": "uint256"
      }, {
        "name": "hash",
        "type": "bytes32"
      }
    ],
    "name": "update",
    "outputs": [],
    "payable": false,
    "type": "function"
  }, {
    "inputs": [],
    "payable": false,
    "type": "constructor"
  }, {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "from",
        "type": "address"
      }, {
        "indexed": false,
        "name": "testimonyID",
        "type": "uint256"
      }, {
        "indexed": false,
        "name": "hash",
        "type": "bytes32"
      }
    ],
    "name": "savedTestimony",
    "type": "event"
  }
];

export class App extends React.Component {
  constructor() {
    super();
    //has to be updated to new contract
    this.contract = parity.bonds.makeContract('0x0AD24CEab0555599429ec755c8492Ae9B2c2Fe94', TestimonyABI);
    this.tests = this.contract.savedTestimony();
    this.state = {
      tx: null,
      //initial firebase speed 10 as example
      speed: 10
    };
  }
  //lifeCycle of the Component, called once it is rendered to the DOM
  componentDidMount() {
    //referencing react child in database
    const rootRef = firebase.database().ref().child('react');
    //speed is subchild of react in firebaseDB
    const speedRef = rootRef.child('speed');
    //once value changes, the DOM gets updated
    speedRef.on('value', snap => {
      this.setState({
        speed: snap.val()
      });
    });
  }
  render() {
    return (
      <div>
      //this is a connection to the firebaseDB
      <h1>{this.state.speed}</h1>
      </div>
    );
  }
}
