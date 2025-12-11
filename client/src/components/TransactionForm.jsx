import React, { useState } from 'react';
import { motion } from 'framer-motion';

function TransactionForm() {
 
  const [formType, setFormType] = useState('Borrowing'); 
  
  const [formData, setFormData] = useState({
    targetUsername: '', 
    amount: '', 
    interestRate: '', 
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    interestType: 'Simple',
    paymentMode: 'Cash',
    screenshot: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, screenshot: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/transactions/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') 
        },
        body: JSON.stringify({ 
          ...formData, 
          amount: Number(formData.amount), 
          interestRate: Number(formData.interestRate),
          userRole: formType === 'Lending' ? 'Lender' : 'Borrower' 
        }),
      });

      if (response.ok) {
        alert("✅ Transaction Saved Successfully!");
        window.location.reload();
      } else {
        const err = await response.json();
        alert("❌ Failed: " + (err.msg || "Check username or details."));
      }
    } catch (error) {
      alert("❌ Network Error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLES ---
  const styles = {
    container: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      marginBottom: '30px',
      maxWidth: '850px',
      margin: '0 auto',
      fontFamily: "'Poppins', sans-serif"
    },
    toggleContainer: {
      display: 'flex',
      backgroundColor: '#f1f5f9',
      padding: '5px',
      borderRadius: '12px',
      marginBottom: '25px',
      cursor: 'pointer'
    },
    toggleButton: (isActive, color) => ({
      flex: 1,
      padding: '12px',
      textAlign: 'center',
      borderRadius: '10px',
      fontWeight: '700',
      fontSize: '0.95rem',
      backgroundColor: isActive ? 'white' : 'transparent',
      color: isActive ? color : '#64748b',
      boxShadow: isActive ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.3s ease'
    }),
    header: { fontSize: '1.25rem', fontWeight: '700', color: '#334155', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#1e293b', outline: 'none', transition: 'all 0.2s' },
    button: { width: '100%', padding: '14px', backgroundColor: formType === 'Lending' ? '#10b981' : '#6366f1', color: 'white', fontWeight: '700', border: 'none', borderRadius: '12px', marginTop: '10px', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.3s' }
  };

  return (
    <div style={styles.container}>
      
      {}
      <div style={styles.toggleContainer}>
        <div 
          style={styles.toggleButton(formType === 'Borrowing', '#6366f1')}
          onClick={() => setFormType('Borrowing')}
        >
          📥 I want to Borrow
        </div>
        <div 
          style={styles.toggleButton(formType === 'Lending', '#10b981')}
          onClick={() => setFormType('Lending')}
        >
          📤 I want to Lend
        </div>
      </div>

      <h2 style={styles.header}>
        {formType === 'Borrowing' ? 'Request a Loan' : 'Add an Investment'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Start Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required style={styles.input}/>
          </div>
          <div>
            <label style={styles.label}>Due Date (Deadline)</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} style={styles.input}/>
          </div>
        </div>
        
        {}
        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>
            {formType === 'Borrowing' ? 'Lender Username (Who is giving money?)' : 'Borrower Username (Who is taking money?)'}
          </label>
          <input type="text" name="targetUsername" placeholder="e.g. monica" value={formData.targetUsername} onChange={handleChange} required style={styles.input}/>
        </div>

        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Amount (₹)</label>
            <input type="number" name="amount" placeholder="5000" value={formData.amount} onChange={handleChange} required style={styles.input}/>
          </div>
          <div>
            <label style={styles.label}>Interest Rate (%/mo)</label>
            <input type="number" name="interestRate" placeholder="2" value={formData.interestRate} onChange={handleChange} required style={styles.input}/>
          </div>
        </div>

        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Interest Type</label>
            <select name="interestType" value={formData.interestType} onChange={handleChange} style={styles.input}>
              <option value="Simple">Simple Interest</option>
              <option value="Compound">Compound Interest</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Payment Mode</label>
            <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={styles.input}>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>Proof / Screenshot</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{...styles.input, padding: '8px'}} />
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? 'Saving...' : formType === 'Borrowing' ? 'Request Loan' : 'Add Investment'}
        </motion.button>
      </form>
    </div>
  );
}

export default TransactionForm;