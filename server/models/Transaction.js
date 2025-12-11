const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  interestType: { type: String, enum: ['Simple', 'Compound'], default: 'Simple' },
  
  date: { type: Date, default: Date.now },
  dueDate: { type: Date },
  
  status: { type: String, enum: ['Active', 'Paid', 'Overdue'], default: 'Active' },
  
  repayments: [{
    amount: Number,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Transaction', TransactionSchema);