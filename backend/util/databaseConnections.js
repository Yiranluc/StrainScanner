const mongoose = require('mongoose');

/**
 * Connects to the database.
 */
const databaseConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_LINK, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      keepAliveInitialDelay: 300000
    });
    mongoose.set('useFindAndModify', false);
  } catch (e) {
    console.log(e);
  }
};

/**
 * Disconnects from the database.
 */
const databaseDisconnect = async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  databaseConnect: databaseConnect,
  databaseDisconnect: databaseDisconnect
};
