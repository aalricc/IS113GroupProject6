// searchHistory-model.js
const mongoose = require('mongoose');

const searchEntrySchema = new mongoose.Schema({
  userId:{
    type:  String,
    default: ""
    },

  query:{ 
    type: String, 
    required: true},

  results:{
    type: Array,
    default: []},

  resultCount:{
    type: Number, 
    default: 0 },
  searchCount: {
    type: Number, 
    default: 0 },
  searchedAt:  {
    type: Date, 
    default: 0
  }
});

searchEntrySchema.index(
  { userId: 1, query: 1 },
  { unique: true }
);
const SearchHistory = mongoose.model('SearchHistory', searchEntrySchema);

SearchHistory.findByIDandSort = function(userId) {
  return SearchHistory.find({ userId }).sort({ searchedAt: -1 });
};

SearchHistory.upHistory = function(_id, searchCount) {
  return SearchHistory.updateOne({ _id }, { searchedAt: new Date(), searchCount: searchCount + 1 });
};

SearchHistory.findExistingHistoryQuery = function(userId, query) {
  return SearchHistory.findOne({ userId, query });
};

SearchHistory.addHistory = function(newHistory) {
  return SearchHistory.create(newHistory);
};

SearchHistory.clearHist = function(userId) {
  return SearchHistory.deleteMany({ userId });
};

module.exports = { SearchHistory };