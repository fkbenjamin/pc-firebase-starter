pragma solidity ^0.4.11;

import "./mortal.sol";
import "./Storage.sol";

/// @title Embassy contract
/// version 0.2
/// Embassies are assigned to a country and can create Visa Offerings
/// and grant Visa.
contract Embassy is owned, mortal {
    address public usedStorage;
    address public nationCtrl;

    mapping (address => uint) public embassiesOfCountry;

    modifier onlyEmbassy() {
        require(embassiesOfCountry[msg.sender] != 0);
        _;
    }

    modifier onlyNation() {
        require(msg.sender == nationCtrl);
        _;
    }

    function Embassy(address _usedStorage) {
        usedStorage = _usedStorage;
    }
    function setStorage(address _store) onlyOwner() returns (bool) {
        usedStorage = _store;
        return true;
    }

    function setNation(address _nation) onlyOwner() returns (bool) {
        nationCtrl = _nation;
        return true;
    }

    function addEmbassyOfCountry(address _embassy, uint _country) onlyNation() {
        embassiesOfCountry[_embassy] = _country;
    }

    //-----------------------

    function getVisaOffering(uint _country, uint _index) constant returns (uint country, bytes32 identifier, bytes32 description, uint validity, uint price, bytes32 conditions) {
        var (cou,i,d,v,p,con) = Storage(usedStorage).visaOfferings(_country, _index);
        country = uint(cou);
        identifier = bytes32(i);
        description = bytes32(d);
        validity = uint(v);
        price = uint(p);
        conditions = bytes32(con);
    }

    function createVisaOffering(uint _country, bytes32 _identifier, bytes32 _description, uint _validity, uint _price, bytes32 _conditions) {
        require(embassiesOfCountry[msg.sender] == _country);
        Storage(usedStorage).createVisaOffering( _country, _identifier, _description, _validity, _price, _conditions);
    }

    function getVisaOfferingsLength(uint _country) constant returns (uint) {
        return Storage(usedStorage).visaOfferingsLength(_country);
    }

    function deleteVisaOffering(uint _country, uint _index) {
        require(embassiesOfCountry[msg.sender] == _country);
        Storage(usedStorage).deleteVisaOffering( _country, _index);

    }

    function verifyPass(address _owner, bytes32 _hashedPassport) {
        // TODO: add modifier onlyEmbassy()
        var (,h,) = Storage(usedStorage).passByOwner(_owner);
        require(bytes32 (h) == _hashedPassport);
        // TODO: require embassy to be of right country
        Storage(usedStorage).updatePassport(_owner, _hashedPassport, true);
    }
}
