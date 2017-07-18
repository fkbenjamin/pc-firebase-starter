pragma solidity ^0.4.11;

import "./mortal.sol";
import "./Storage.sol";

/// @title Embassy contract
/// Embassies are assigned to a country and can create Visa Offerings
/// and grant Visa.
contract Embassy is owned, mortal {
    string constant public version = "0.4.0";
    
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

    function createVisaOffering(uint _country, bytes32 _identifier, bytes32 _description, uint _validity, uint _price, bytes32 _conditions) {
        require(embassiesOfCountry[msg.sender] == _country);
        Storage(usedStorage).createVisaOffering( _country, _identifier, _description, _validity, _price, _conditions);
    }

    function deleteVisaOffering(uint _country, uint _index) {
        require(embassiesOfCountry[msg.sender] == _country);
        Storage(usedStorage).deleteVisaOffering( _country, _index);
    }

    function verifyPass(address _owner, bytes32 _hashedPassport) {
        var (,c,h,) = Storage(usedStorage).passByOwner(_owner);
        uint _country = uint(c);

        // An embassy can only verify passports of its own country
        require(_country == embassiesOfCountry[msg.sender]);

        // Hashes must be right
        require(bytes32 (h) == _hashedPassport);

        Storage(usedStorage).updatePassport(_owner, _country, _hashedPassport, true);
    }
}
