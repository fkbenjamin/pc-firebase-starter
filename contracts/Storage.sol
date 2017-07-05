pragma solidity ^0.4.0;

import "./mortal.sol";

/// @title Storage for Pass, Visa and Visa Offerings
/// @version 0.2
contract Storage is owned, mortal {

    string constant public version = "0.1.0";

    // Access right variables
    address citizen;
    address country;
    address immigration;
    address embassy;

    // Modifiers
    modifier only(bool citizens, bool countries, bool immigrations, bool embassies) {
        if (citizens) { require(msg.sender == citizen); }
        if (countries) { require(msg.sender == country); }
        if (immigrations) { require(msg.sender == immigration); }
        if (embassies) { require(msg.sender == embassy); }
        _;
    }

    // Set Access right variables
    function setCitizen(address _citizen) onlyOwner() {
        citizen = _citizen;
    }

    function setCountry(address _country) onlyOwner() {
        country = _country;
    }

    function setImmigration(address _immigration) onlyOwner() {
        immigration = _immigration;
    }

    function setEmbassy(address _embassy) onlyOwner() {
        embassy = _embassy;
    }


    // Actual contract logic
    struct Passport {
        address owner;
        bytes32 hashedPassport;
        bool valid;
    }

    mapping (address => Passport) public passByOwner;

    function updatePassport(address _owner, bytes32 _hashedPassport, bool _valid) {
        passByOwner[_owner] = Passport({
            owner: _owner,
            hashedPassport: _hashedPassport,
            valid: _valid
        });
    }

    //-------

    struct VisaOffering {
        uint country; // as ISO 3166-1 numeric code
        string identifier;
        string description;
        uint validity; // in # of blocks
        uint price;
        string conditions;
    }

    /**
     * Get visa offering as following:
     * visaOfferings(address country, string identifier)
     * @return VisaOffering
     */
    mapping (uint => VisaOffering[]) public visaOfferingsByCountry;

    function createVisaOffering(address _country, string _identifier, string _condition) {
        visaOfferingsByCountry[_country].push(VisaOffering({
            country: _country,
            identifier: _identifier,
            conditions: _condition
        }));
    }

    function deleteAllVisaOfferings(address _country) {
        delete visaOfferingsByCountry[_country];
    }

    //--------------

    struct Visa {
        address owner;
        address country;
        string identifier;
        uint amountPaid;
        uint price;
        uint entered; // highest block # when entering country
        bool hasLeft;
    }

    /** Gets all the visa assigned to a citizen */
    mapping(address => Visa[]) public visaByOwner;

    /**
     * Creates a new visa and returns the index of the visa
     */
     function visaLength(address _owner) {
       return visaByOwner[_owner].length;
     }

    function createVisa(address _owner, address _country, string _identifier, uint _price) {
        visaByOwner[_owner].push(Visa({
            owner: _owner,
            country: _country,
            identifier: _identifier,
            amountPaid: 0,
            price: _price,
            hasEntered: false,
            hasLeft: false
        }));
    }

    function updateVisa(address _owner, uint _visaId, uint _amountPaid,
                        bool _hasEntered, bool _hasLeft)  {
        Visa oldVisa = visaByOwner[_owner][_visaId];

        visaByOwner[_owner][_visaId] = Visa({
            owner: _owner,
            country: oldVisa.country,
            identifier: oldVisa.identifier,
            amountPaid: _amountPaid,
            price: oldVisa.price,
            hasEntered: _hasEntered,
            hasLeft: _hasLeft
        });
    }

    function deleteVisa(address _owner, uint index) {
      delete visaByOwner[_owner][index];
    }
}
