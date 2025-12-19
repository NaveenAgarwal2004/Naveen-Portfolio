/**
 * Centralized export for all Zod validators
 * Import validators from this file for cleaner imports
 */

const projectValidators = require('./projectValidator');
const contactValidators = require('./contactValidator');
const personalValidators = require('./personalValidator');
const certificateValidators = require('./certificateValidator');
const techStackValidators = require('./techStackValidator');

module.exports = {
  // Project validators
  ...projectValidators,
  
  // Contact validators
  ...contactValidators,
  
  // Personal validators
  ...personalValidators,
  
  // Certificate validators
  ...certificateValidators,
  
  // Tech stack validators
  ...techStackValidators
};
