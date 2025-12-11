import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 


import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';


function Dashboard() {
  const [totals, setTotals] = useState({ given: 0, taken: 0 });
  const [chartData, setChartData] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      if(Array.isArray(data)) calculateStats(data);
    } catch (error) { console.error("Error:", error); }
  };

  const calculateStats = (transactions) => {
    let totalGiven = 0, totalTaken = 0;
    const today = new Date();
    let badDebts = [];

    transactions.forEach(t => {
      const lenderId = t.lender?._id || t.lender;
      const iAmLender = lenderId === user.id || lenderId === user._id;

      const months = Math.ceil(Math.abs(today - new Date(t.date)) / (1000 * 60 * 60 * 24)) / 30.44;
      let totalDebt = 0;
      if (t.interestType === 'Compound') totalDebt = t.amount * Math.pow((1 + t.interestRate / 100), months);
      else totalDebt = t.amount + (t.amount * t.interestRate * months) / 100;

      const totalPaid = (t.repayments || []).reduce((acc, curr) => acc + curr.amount, 0);
      const remaining = totalDebt - totalPaid;

      if (remaining > 0) {
        if (iAmLender) totalGiven += remaining;
        else totalTaken += remaining;

        if (t.dueDate && new Date(t.dueDate) < today && iAmLender) {
          badDebts.push({ 
            name: t.borrower?.username || t.personName || 'Someone', 
            amount: remaining.toFixed(0), 
            date: new Date(t.dueDate).toLocaleDateString() 
          });
        }
      }
    });

    setTotals({ given: totalGiven, taken: totalTaken });
    setOverdueList(badDebts);
    
    const newChartData = [];
    if (totalGiven > 0) newChartData.push({ name: 'Receive', value: Math.round(totalGiven) });
    if (totalTaken > 0) newChartData.push({ name: 'Pay', value: Math.round(totalTaken) });
    setChartData(newChartData);
  };

  
  const styles = {
    container: {
      padding: '40px',
      fontFamily: "'Poppins', sans-serif",
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: '#f8fafc', 
      minHeight: '100vh'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '2.2rem',
      fontWeight: '800',
      color: '#1e293b',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    subTitle: {
      color: '#64748b',
      marginTop: '5px',
      fontSize: '1rem',
      fontWeight: '500'
    },
    logoutBtn: {
      padding: '12px 28px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      transition: 'transform 0.2s'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      marginBottom: '50px'
    },
    cardGreen: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '35px',
      borderRadius: '24px',
      boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },
    cardRed: {
      background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      padding: '35px',
      borderRadius: '24px',
      boxShadow: '0 20px 25px -5px rgba(244, 63, 94, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: 'white'
    },
    cardChart: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardLabel: {
      fontSize: '0.85rem',
      fontWeight: '700',
      opacity: 0.9,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px'
    },
    amountText: { 
      fontSize: '3rem', 
      fontWeight: '800', 
      textShadow: '0 2px 10px rgba(0,0,0,0.1)' 
    },
    chartWrapper: { height: '250px', width: '100%' }
  };

  return (
    <div style={styles.container}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}
      </style>

      {}
      <motion.div 
        style={styles.headerRow}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <div style={styles.subTitle}>Welcome back, {user.fullName || user.username || 'User'}</div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout} 
          style={styles.logoutBtn}
        >
          Logout
        </motion.button>
      </motion.div>

      {}
      {overdueList.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ backgroundColor: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '16px', padding: '16px', color: '#be123c', marginBottom: '30px', display:'flex', gap:'12px', alignItems:'center' }}
        >
          <span style={{fontSize:'1.5rem'}}>🚨</span>
          <div>
            <strong>Action Required:</strong>
            <ul style={{ margin: '5px 0 0 20px', fontSize: '0.9rem' }}>
              {overdueList.map((item, idx) => (
                <li key={idx}>{item.name} is overdue by <strong>₹{item.amount}</strong></li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {}
      <div style={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <motion.div 
            style={styles.cardGreen}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <span style={styles.cardLabel}>You will Receive</span>
            <span style={styles.amountText}>₹{totals.given.toLocaleString()}</span>
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
          </motion.div>

          <motion.div 
            style={styles.cardRed}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <span style={styles.cardLabel}>You Must Pay</span>
            <span style={styles.amountText}>₹{totals.taken.toLocaleString()}</span>
          </motion.div>
        </div>

        <motion.div 
          style={styles.cardChart}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span style={{...styles.cardLabel, color: '#64748b'}}>Portfolio Balance</span>
          <div style={styles.chartWrapper}>
            {(totals.given > 0 || totals.taken > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Receive' ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{height:'100%', display:'flex', alignItems:'center', color:'#cbd5e1', fontWeight:'500'}}>No Active Loans</div>
            )}
          </div>
        </motion.div>
      </div>

      {}
      <motion.div 
        style={{ marginBottom: '40px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <TransactionForm />
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <TransactionList />
      </motion.div>
      
      {}

    </div>
  );
}

export default Dashboard;