const mongoose = require('mongoose');

/**
 * Check if MongoDB supports transactions (replica set or sharded cluster)
 * @returns {boolean} True if transactions are supported
 */
const isTransactionSupported = () => {
  try {
    // Check if we're connected to a replica set or sharded cluster
    const adminDb = mongoose.connection.db.admin();
    return mongoose.connection.readyState === 1 && 
           (mongoose.connection.db.serverConfig?.ismaster?.isreplicaset || 
            mongoose.connection.db.serverConfig?.ismaster?.msg === 'isdbgrid');
  } catch (error) {
    console.log('Transaction support check failed:', error.message);
    return false;
  }
};

/**
 * Execute operations with or without transactions based on MongoDB configuration
 * @param {Function} operations - Async function containing the operations to execute
 * @param {Object} options - Options for transaction execution
 * @returns {Promise} Result of operations
 */
const withOptionalTransaction = async (operations, options = {}) => {
  if (isTransactionSupported()) {
    // Use transactions if supported
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const result = await operations(session);
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else {
    // Execute without transactions
    console.log('Executing without transactions (MongoDB standalone mode)');
    return await operations(null);
  }
};

module.exports = {
  isTransactionSupported,
  withOptionalTransaction
};
