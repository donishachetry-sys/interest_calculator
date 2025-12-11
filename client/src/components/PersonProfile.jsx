import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function PersonProfile() {
  const { name } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, type: 'Neutral' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    
    const response = await fetch('http://localhost:5000/api/transactions', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    const allData = await response.json();
    
    if (Array.isArray(allData)) {
      const personData = allData.filter(t => t.personName.toLowerCase() === name.toLowerCase());
      setTransactions(personData);
      calculateStats(personData);
    }
  };

  const calculateStats = (data) => {
    let balance = 0;
    data.forEach(t => {
      const months = Math.ceil(Math.abs(new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24)) / 30.44;
      let totalDebt = 0;
      if (t.interestType === 'Compound') totalDebt = t.amount * Math.pow((1 + t.interestRate / 100), months);
      else totalDebt = t.amount + (t.amount * t.interestRate * months) / 100;

      const totalPaid = (t.repayments || []).reduce((acc, curr) => acc + curr.amount, 0);
      const remaining = totalDebt - totalPaid;

      if (remaining > 0) {
        if (t.type === 'Given') balance += remaining;
        else balance -= remaining;
      }
    });

    setStats({ 
      total: Math.abs(balance).toFixed(0), 
      type: balance >= 0 ? 'Receivable' : 'Payable' 
    });
  };

  return (
    <div className="app-container">
      <Link to="/" style={{ textDecoration: 'none', color: '#666', fontWeight: 'bold' }}>← Back to Dashboard</Link>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '10px' }}>Profile: {name}</h1>
        <div className={`stat-card ${stats.type === 'Receivable' ? 'green' : 'red'}`} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h3>Total {stats.type === 'Receivable' ? 'You will Receive' : 'You Must Pay'}</h3>
          <h1 style={{ fontSize: '48px', margin: '10px 0' }}>₹{stats.total}</h1>
        </div>
      </div>
      <h3 style={{ marginTop: '40px' }}>Transaction History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t._id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td><span className={`status-badge ${t.type === 'Given' ? 'badge-given' : 'badge-taken'}`}>{t.type}</span></td>
              <td>₹{t.amount}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PersonProfile;