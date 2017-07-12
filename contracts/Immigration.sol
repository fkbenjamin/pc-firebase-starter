pragma solidity ^0.4.11;
import "./mortal.sol";
import "./Storage.sol";

/// @title Immigration
/// version 0.3
/// The immigration acts as a the border patrol. Citizens passing Immigration
/// have to provide a valid visa. The visa will be stamped when entering and
/// leaving the country
contract Immigration is owned, mortal {
    address usedStorage;
    address nationCtrl;

    struct Visa {
        address owner;
        uint country; // as ISO 3166-1 numeric code
        bytes32 identifier;
        uint amountPaid;
        uint price;
        uint entered; // highest block # when entering country
        uint left;    // highest block # when leaving country
    }

    mapping (address => uint) immigrationOfCountry;

    modifier onlyImmigration() {
        require(immigrationOfCountry[msg.sender] != 0);
        _;
    }

    modifier onlyNation() {
        require(msg.sender == nationCtrl);
        _;
    }

    function Immigration() {
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

    function addImmigrationOfCountry(address _immigration, uint _country) onlyNation() {
        immigrationOfCountry[_immigration] = _country;
    }

    function getPass(address _user) onlyImmigration() constant returns (address, bytes32, bool) {
        return Storage(usedStorage).passByOwner(_user);
    }

    function getVisaLength(address _owner, uint _country) constant returns (uint) {
        return Storage(usedStorage).visaLength(_owner, _country);
    }

    function getVisa(address _user, uint _country, uint _arrayPosition) onlyImmigration() constant returns(
        address _userAdd,
        uint _countryId,
        bytes32 _identifier,
        uint _amountPaid,
        uint _price,
        uint _entered,
        uint _left)
    {
        _userAdd = _user;
        _countryId = _country;
        _identifier = getVisaIdentifier(_user, _country, _arrayPosition);
        _amountPaid = getVisaAmountPaid(_user, _country, _arrayPosition);
        _price = getVisaPrice(_user, _country, _arrayPosition);
        _entered = getVisaEntered(_user, _country, _arrayPosition);
        _left = getVisaLeft(_user, _country, _arrayPosition);

    }

    function getVisaIdentifier(address _user, uint _country, uint _arrayPosition) onlyImmigration() constant returns(
        bytes32 _identifier
        )
    {
        var(,,c,,,,) = Storage(usedStorage).visaStore(_user, _country, _arrayPosition);
        _identifier = bytes32(c);
    }

    function getVisaAmountPaid(address _user, uint _country, uint _arrayPosition) onlyImmigration() constant returns(
        uint _amountPaid
        )     {
        var(,,,d,,,) = Storage(usedStorage).visaStore(_user, _country, _arrayPosition);
        _amountPaid = uint(d);
    }
    function getVisaPrice(address _user, uint _country, uint _arrayPosition) onlyImmigration() constant returns(
        uint _price
        )     {
        var(,,,,e,,) = Storage(usedStorage).visaStore(_user, _country, _arrayPosition);
        _price = uint(e);
    }
    function getVisaEntered(address _user, uint _country, uint _arrayPosition) onlyImmigration() constant returns(
        uint _entered
        )     {
        var(,,,,,f,) = Storage(usedStorage).visaStore(_user, _country, _arrayPosition);
        _entered = uint(f);
    }
    function getVisaLeft(address _user, uint _country, uint _arrayPosition) onlyImmigration() constant returns(
        uint _left
        )     {
        var(,,,,,,g) = Storage(usedStorage).visaStore(_user, _country, _arrayPosition);
        _left = uint(g);
    }


    function stampIn(address _owner, uint _country, uint _visaId) returns (bool) {
        // Visa wasn't used so far
        require(getVisaEntered(_owner,_country,_visaId) == 0);

        Storage(usedStorage).updateVisa(
            _owner,
            _country,
            _visaId,
            getVisaAmountPaid(_owner,_country,_visaId),
            now,
            0
        );
        return true;
    }

    function stampOut(address _owner, uint _country, uint _visaId) returns (bool) {
        // Visa was used for Entry
        require(getVisaEntered(_owner,_country,_visaId) > 0);

        // Person has to be entered in the past
        require(getVisaEntered(_owner,_country,_visaId) <= now);

        // Visa wasn't used for exit
        require(getVisaLeft(_owner,_country,_visaId) == 0);

        Storage(usedStorage).updateVisa(
            _owner,
            _country,
            _visaId,
            getVisaAmountPaid(_owner,_country,_visaId),
            getVisaEntered(_owner,_country,_visaId) ,
            now
        );
        return true;
    }
}
