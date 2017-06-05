pragma solidity ^0.4.11;

import "./mortal.sol";

/// @title Storage for Pass, Visa and Visa Offerings
contract Storage is owned, mortal {

    string constant version = "0.1.0";

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

    // Constructor
    function Storage() {
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

    function updatePassport(address _owner, bytes32 _hashedPassport, bool _valid)
            only(true, true, false, false) {
        passByOwner[_owner] = Passport({
            owner: _owner,
            hashedPassport: _hashedPassport,
            valid: _valid
        });
    }

    struct VisaOffering {
        address country;
        string identifier;
        string conditions;
    }

    /**
     * Get visa offering as following:
     * visaOfferings(address country, string identifier)
     * @return VisaOffering
     */
    mapping(address => VisaOffering[]) public visaOfferingsByCountry;

    function createVisaOffering(address _country, string _identifier, string _condition)
            only(false, false, true, false) {
        visaOfferingsByCountry[_country].push(VisaOffering({
            country: _country,
            identifier: _identifier,
            conditions: _condition
        }));
    }

    function deleteAllVisaOfferings(address _country)
            only(false, false, false, true) {
        delete visaOfferingsByCountry[_country];
    }

    struct Visa {
        address owner;
        address country;
        string identifier;
        bool isPayed;
        bool hasEntered;
        bool hasLeft;
    }

    /** Gets all the visa assigned to a citizen */
    mapping(address => Visa[]) public visaByOwner;

    /**
     * Creates a new visa and returns the index of the visa
     */
    function createVisa(address _owner, address _country, string _identifier) returns (uint visaId) {
        visaId = visaByOwner[_owner].push(Visa({
            owner: _owner,
            country: _country,
            identifier: _identifier,
            isPayed: false,
            hasEntered: false,
            hasLeft: false
        }));
        visaId -= 1;
    }

    function updateVisa(address _owner, uint visaId, address _country, string _identifier, bool _isPayed, bool _hasEntered, bool _hasLeft) {
        visaByOwner[_owner][visaId] = Visa({
            owner: _owner,
            country: _country,
            identifier: _identifier,
            isPayed: _isPayed,
            hasEntered: _hasEntered,
            hasLeft: _hasLeft
        });
    }
}
