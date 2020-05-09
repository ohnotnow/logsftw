const program = require('./opts.js');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// connect to mongodb
const mongoOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
if (program.user) {
  mongoOpts['user'] = program.user;
}
if (program.password) {
  mongoOpts['password'] = program.password;
}
mongoose.connect(program.mongo, mongoOpts).catch(err => {
  console.error('Failed to connect to mongodb : ' + err);
});
mongoose.connection.on('error', err => {
  console.error('Mongodb error : ' + err);
});
const logSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now, expires: parseFloat(program.ttl) * 60 * 60 },
  action: String,
  datetime: { type: Date, index: true },
  username: { type: String, index: true },
  domain: String,
  computername: { type: String, index: true },
  MiscData: String,
  data: Object,
  MAC: String,
  IP: String,
  OS: String,
  SessionType: String,
  combined_message: String
});
logSchema.plugin(mongoosePaginate);
const Log = mongoose.model('Logs', logSchema);

module.exports = Log;
