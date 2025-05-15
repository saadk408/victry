module.exports = {
  hasteImplModulePath: null, // Use the default implementation
  
  // Skip .next directory to avoid collisions
  modulePathIgnorePatterns: [
    '<rootDir>/.next'
  ]
};