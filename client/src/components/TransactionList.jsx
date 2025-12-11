import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';
import JSConfetti from 'js-confetti';
import { motion, AnimatePresence } from 'framer-motion';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const myId = user.id || user._id; 

  const fetchTransactions = async () => {
    if(transactions.length === 0) setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]); 
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, { 
        method: 'DELETE',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchTransactions(); 
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleAddPayment = async (id, isLender) => {
   
    const promptMsg = isLender 
      ? "Enter amount you RECEIVED (₹):" 
      : "Enter amount you are PAYING (₹):";

    const amount = prompt(promptMsg);
    if (!amount || isNaN(amount)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${id}/pay`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') 
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti({
          emojis: ['💸', '✨', '✅', '💳'],
          emojiSize: 50,
          confettiNumber: 60,
        });
        fetchTransactions(); 
      }
    } catch (error) {
      alert("Payment failed");
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const calculateTotals = (t) => {
    const months = (Math.ceil(Math.abs(new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24)) / 30.44).toFixed(1);
    let totalDebt = 0;
    if (t.interestType === 'Compound') {
      totalDebt = t.amount * Math.pow((1 + t.interestRate / 100), months);
    } else {
      totalDebt = t.amount + (t.amount * t.interestRate * months) / 100;
    }
    const totalPaid = (t.repayments || []).reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = totalDebt - totalPaid;

    return { months, totalDebt: totalDebt.toFixed(0), totalPaid: totalPaid.toFixed(0), remaining: remaining.toFixed(0) };
  };

  const openScreenshot = (imgString) => {
    const newTab = window.open();
    newTab.document.write(`<img src="${imgString}" style="max-width: 100%; margin: 20px auto; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const tableRows = [];
    transactions.forEach(t => {
      const math = calculateTotals(t);
     
      const lenderId = t.lender?._id || t.lender;
      const isLender = lenderId === myId;
      const typeLabel = isLender ? 'Given' : 'Taken';

      tableRows.push([
        new Date(t.date).toLocaleDateString(),
        t.personName || (t.borrower?.username === user.username ? t.lender?.username : t.borrower?.username),
        typeLabel,
        `Rs. ${t.amount}`,
        `Rs. ${math.totalPaid}`,
        `Rs. ${math.remaining}`
      ]);
    });
    autoTable(doc, { 
      head: [["Date", "Name", "Type", "Principal", "Paid", "Remaining"]], 
      body: tableRows, 
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] } 
    });
    doc.save("Interest_Report.pdf");
  };

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      padding: '30px',
      overflowX: 'auto',
      fontFamily: "'Poppins', sans-serif"
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px'
    },
    title: { fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', margin: 0 },
    actionBtn: { padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', minWidth: '800px' },
    th: { textAlign: 'left', padding: '0 16px 12px 16px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', borderRadius: '12px' },
    td: { padding: '18px 16px', color: '#334155', fontSize: '0.95rem', verticalAlign: 'middle', borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
   
    payBtn: (isLender) => ({
      backgroundColor: isLender ? '#0ea5e9' : '#10b981',
      color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
    }),
    delBtn: { background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Transaction History</h2>
        <div style={{display: 'flex', gap: '12px'}}>
          <motion.button whileHover={{ scale: 1.05 }} onClick={generatePDF} style={{...styles.actionBtn, backgroundColor:'#e0e7ff', color:'#4338ca'}}>📄 Export PDF</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={fetchTransactions} style={{...styles.actionBtn, backgroundColor:'#f1f5f9', color:'#475569'}}>🔄 Refresh</motion.button>
        </div>
      </div>

      {isLoading ? (
        <div style={{textAlign:'center', padding:'60px', color:'#94a3b8'}}>Loading your records...</div>
      ) : transactions.length === 0 ? (
        <div style={{textAlign:'center', padding:'60px', color:'#94a3b8', backgroundColor:'#f8fafc', borderRadius:'16px', border:'2px dashed #e2e8f0'}}>
          <p style={{fontSize:'1.1rem'}}>No transactions found.</p>
          <span style={{fontSize:'0.9rem'}}>Add a loan or investment above to get started!</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Counterparty</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Principal</th>
              <th style={styles.th}>Total Due</th>
              <th style={styles.th}>Paid</th>
              <th style={styles.th}>Remaining</th>
              <th style={styles.th}>Proof</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
            {transactions.map((t, index) => {
              const math = calculateTotals(t);
              const isSettled = math.remaining <= 0;
              
             
              const lenderId = t.lender?._id || t.lender;
              const isLender = lenderId === myId;
              
             
              const typeLabel = isLender ? 'Given' : 'Taken';
              const isAsset = isLender; 
              const buttonText = isLender ? 'Receive' : 'Pay'; 

              return (
                <motion.tr 
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }} 
                  style={{...styles.tr, opacity: isSettled ? 0.6 : 1}}
                  whileHover={{ scale: 1.01, backgroundColor: '#fdfdfd' }}
                >
                  <td style={{...styles.td, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'}}>
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  
                  <td style={styles.td}>
                    <Link to={`/person/${t.personName || 'user'}`} style={{ textDecoration: 'none', color: '#6366f1', fontWeight:'600' }}>
                      {t.personName || (t.borrower?.username === user.username ? t.lender?.username : t.borrower?.username)}
                    </Link>
                  </td>
                  
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge, 
                      backgroundColor: isAsset ? '#d1fae5' : '#fee2e2', 
                      color: isAsset ? '#047857' : '#b91c1c'
                    }}>
                      {typeLabel} {}
                    </span>
                  </td>
                  
                  <td style={{...styles.td, fontWeight:'500'}}>₹{t.amount}</td>
                  <td style={{...styles.td, color:'#64748b'}}>₹{math.totalDebt}</td>
                  <td style={{...styles.td, color:'#10b981'}}>₹{math.totalPaid}</td>
                  
                  <td style={styles.td}>
                    {isSettled ? (
                      <span style={{color:'#10b981', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>✓ PAID</span>
                    ) : (
                      <span style={{fontWeight:'700', color: '#1e293b'}}>₹{math.remaining}</span>
                    )}
                  </td>
                  
                  <td style={styles.td}>
                    {t.screenshot ? (
                      <button onClick={() => openScreenshot(t.screenshot)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}} title="View Proof">📷</button>
                    ) : <span style={{color:'#cbd5e1'}}>-</span>}
                  </td>

                  <td style={{...styles.td, borderTopRightRadius: '12px', borderBottomRightRadius: '12px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      {!isSettled && (
                        <motion.button 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleAddPayment(t._id, isLender)} 
                          style={styles.payBtn(isLender)} 
                          title={isLender ? "Record Received Payment" : "Make Payment"}
                        >
                          {buttonText} {}
                        </motion.button>
                      )}
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(t._id)} style={styles.delBtn} title="Delete Record">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            </AnimatePresence>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionList;