const mongoose = require('mongoose');

const searchEntrySchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query:       { type: String, required: true },
  results:     { type: Array,  default: [] },
  resultCount: { type: Number, default: 0 },
  searchedAt:  { type: Date,   default: Date.now }
});

const SearchHistory = mongoose.model('SearchHistory', searchEntrySchema);
module.exports = { SearchHistory };