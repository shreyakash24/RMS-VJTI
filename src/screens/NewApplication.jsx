import React, { useState } from 'react';

export default function NewApplication({ navigate, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create FormData object to handle file + text
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('amount', formData.amount);
    data.append('date', formData.date);
    data.append('description', formData.description);
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    // Call the parent onSubmit handler (which we will update in App.jsx)
    await onSubmit(data); 
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-[#002045] mb-6">New Reimbursement Application</h2>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title</label>
            <input 
              type="text" 
              name="title"
              placeholder="e.g. Workshop Fees"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#002045]" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#002045]" 
              required
            >
              <option value="">Select category</option>
              <option value="Travel">Travel</option>
              <option value="Supplies">Supplies</option>
              <option value="Equipment">Equipment</option>
              <option value="Conference">Conference</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01" 
              name="amount"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#002045]" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Expense</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#002045]" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description / Justification</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#002045]" 
            rows="4" 
            placeholder="Provide details about why this expense was necessary..."
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt (PDF/Image)</label>
          <input 
            type="file" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#002045]" 
            required
          />
          <p className="text-xs text-gray-500 mt-1">Institutional requirement: A valid receipt must be attached.</p>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button 
            type="button" 
            onClick={() => navigate('dashboard')} 
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#002045] text-white rounded-md hover:bg-[#1a365d] font-medium transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}