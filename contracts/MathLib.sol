pragma solidity >=0.7.0 <0.9.0;

library MathLib {
    uint256 constant public SCALING_FACTOR = 100;

    // in order to work with floating point numbers, we need to scale the numbers
    // we keep in mind that in order to use the real result we need to divide by SCALING_FACTOR
    function floatingDivision(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * SCALING_FACTOR / b;
    }
}