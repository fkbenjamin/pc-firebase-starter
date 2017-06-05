pragma solidity ^0.4.11;

import "./Storage.sol";

/// @title Citizen
/// A country has citizens which can obtain passports and apply for visa.
contract Citizen is owned, mortal {

    // All data is stored centrally in a storage contract so it can be accessed
    // by all entities.
    Storage private database;

    function Citizen(Storage _database) {
        super();
        database = _database;
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
    function getOwnPassport() returns (address owner, bytes32 hashedPass, bool valid) {
        return database.passByOwner(msg.sender);
    }
}
