pragma solidity ^0.4.0;

import "./mortal.sol";
import "./Storage.sol";

/// @title Citizen
/// A country has citizens which can obtain passports and apply for visa.
contract Citizen is owned, mortal {

    // All data is stored centrally in a storage contract so it can be accessed
    // by all entities.
    Storage private database;

    struct Visa {
        address owner;
        uint country; // as ISO 3166-1 numeric code
        bytes32 identifier;
        uint amountPaid;
        uint price;
        uint entered; // highest block # when entering country
        uint left;    // highest block # when leaving country
    }


    function Citizen(address _database) {
        database = Storage(_database);
    }

    function setStorage(Storage _database) onlyOwner() {
        database = _database;
    }

    /**
     * Everybody can create a passport which is initially invalid
     */
    function createPassport(bytes32 hashedPass) {
        bool valid = false;
        address owner = msg.sender;
        database.updatePassport(owner, hashedPass, valid);
    }

    /**
     * Returns passport of the msg.sender
     */
    function getOwnPassport() constant returns (address owner, bytes32 hashedPass, bool valid){
        return database.passByOwner(msg.sender);
    }

    /**
     * Applies for visa of msg.sender
     * @return {[type]} [description]
     */
    function applyVisa(uint _country, uint _index) {
        var (,i,,,p,) = database.visaOfferings(_country, _index);
        bytes32 _identifier = bytes32(i);
        uint _price = uint(p);
        database.createVisa(msg.sender,_country,_identifier,_price);
    }

    function payVisa() payable {

    }

    function someFunction() {

    }
}
