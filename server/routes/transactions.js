const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');


router.get('/', auth, async (req, res) => {
  try {
    
    const transactions = await Transaction.find({
      $or: [{ lender: req.user.id }, { borrower: req.user.id }]
    })
    .populate('lender', 'username email')   
    .populate('borrower', 'username email') 
    .sort({ date: -1 }); 

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post('/add', auth, async (req, res) => {
  try {
    const { 
      targetUsername, amount, interestRate, date, dueDate, 
      interestType, paymentMode, screenshot, userRole 
    } = req.body;

   
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found. Check the username.' });
    }

    
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot transact with yourself!' });
    }

    
    let lenderId, borrowerId, typeForCreator;

    if (userRole === 'Lender') {
      
      lenderId = req.user.id;      
      borrowerId = targetUser._id; 
      typeForCreator = 'Given';
    } else {
      
      lenderId = targetUser._id;  
      borrowerId = req.user.id;   
      typeForCreator = 'Taken';
    }

    const newTransaction = new Transaction({
      lender: lenderId,
      borrower: borrowerId,
      amount,
      interestRate,
      interestType,
      date,
      dueDate,
      paymentMode,
      screenshot, 
      type: typeForCreator, 
      repayments: []
    });

    const transaction = await newTransaction.save();
    res.json(transaction);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

   
    transaction.repayments.push({
      amount: Number(amount),
      date: new Date()
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    
    if (transaction.lender.toString() !== req.user.id && transaction.borrower.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await transaction.deleteOne(); 
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;