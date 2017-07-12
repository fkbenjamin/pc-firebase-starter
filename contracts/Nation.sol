pragma solidity ^0.4.11;

import "./mortal.sol";

import "./Immigration.sol";
import "./Embassy.sol";

/// @title Nation
/// version 0.2
contract Nation is owned, mortal {

    mapping (address => uint) countries;
    address immigrationCtrl;
    address embassyCtrl;

    /// Set the address that represents a country account
    function setCountry(address country, uint countryId) onlyOwner() {
        require(country != 0x0 && countryId != 0);
        countries[country] = countryId;
    }

    /// Sets the contract that handles all the immigration logic
    function setImmigration(address _immigrationCtrl) onlyOwner() returns (bool) {
        bool result = Immigration(_immigrationCtrl).setNation(this);
        if (result) {
            immigrationCtrl = _immigrationCtrl;
            return true;
        }
        return false;
    }

    /// Sets the contract that handles all the embassy logic
    function setEmbassy(address _embassyCtrl) onlyOwner() returns (bool) {
        bool result = Embassy(_embassyCtrl).setNation(this);
        if (result) {
            embassyCtrl = _embassyCtrl;
            return true;
        }
        return false;
    }

    /// Adds a new immigration of a country
    function addImmigration(address immigration) {
        uint countryId = countries[msg.sender];
        if (immigration != 0x0 && immigrationCtrl != 0x0 && countryId != 0) {
            Immigration(immigrationCtrl).addImmigrationOfCountry(immigration, countryId);
        }
    }

    /// Adds a new embassy of a country
    function addEmbassy(address embassy) {
        uint countryId = countries[msg.sender];
        if (embassy != 0x0 && embassyCtrl != 0x0 && countryId != 0) {
            Embassy(embassyCtrl).addEmbassyOfCountry(embassy, countryId);
        }
    }

    /// Not yet implemented in immigration
    /*function removeImmigration(address immigration) returns (bool) {
        uint countryId = countries[msg.sender];
        if (immigration != 0x0 && immigrationCtrl != 0x0 && countryId != 0) {
            Immigration(immigrationCtrl).removeImmigrationOfCountry(immigration, countryId);
            return true;
        }
        return false;
    }*/

    /// Not yet implemented in embassy
    /*function removeEmbassy(address embassy) returns (bool) {
        uint countryId = countries[msg.sender];
        if (embassy != 0x0 && embassyCtrl != 0x0 && countryId != 0) {
            Embassy(embassyCtrl).removeEmbassyOfCountry(embassy, countryId);
            return true;
        }
        return false;
    }*/
}
