pragma solidity ^0.4.11;

import "./mortal.sol";
import "./Storage.sol";

/// @title Embassy contract
/// version 0.1
/// Embassies are assigned to a country and can create Visa Offerings
/// and grant Visa.
contract Embassy is owned, mortal {
    address usedStorage;
    address nationCtrl;

    mapping (address => uint) embassiesOfCountry;

    modifier onlyEmbassy() {
        require(embassiesOfCountry[msg.sender] != 0);
        _;
    }

    modifier onlyNation() {
        require(msg.sender == nationCtrl);
        _;
    }

    function Embassy() {
        usedStorage = '0x008aB18490E729bBea993817E0c2B3c19c877115';
    }
    function setStorage(address _store) onlyOwner() returns (bool) {
        usedStorage = _store;
        return true;
    }

    function setNation(address _nation) onlyOwner() returns (bool) {
        nationCtrl = _nation;
        return true;
    }
}
