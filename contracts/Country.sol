pragma solidity ^0.4.11;

import "./Storage.sol";

/// @title country
/// One government acts as one country. A country can issue passports by
/// flagging them as a valid passport of their country.
contract Country {

    address owner;
    // All data is stored centrally in a storage contract so it can be accessed
    // by all entities.
    Storage private database;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function Country(Storage _database) {
        database = _database;
        owner = msg.sender;
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
    function validatePassport() returns (address _owner, bytes32 _hashedPass) {
        require(_hashedPass == pass.hashy);
        return database.passport auf valide setzen(msg.sender);
    }
}
