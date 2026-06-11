import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCode, FiBarChart2, FiCpu, FiTrendingUp, FiDollarSign,
  FiHeart, FiActivity, FiUsers, FiBriefcase, FiShield, FiBox, FiLayout,
  FiSettings, FiMessageSquare, FiShoppingCart, FiTool, FiPieChart } from 'react-icons/fi';
import './IndustrySelector.css';

const INDUSTRIES = [
  { key: 'technology', name: 'Technology', icon: <FiCode /> },
  { key: 'data_science', name: 'Data Science', icon: <FiBarChart2 /> },
  { key: 'ai_ml', name: 'AI / Machine Learning', icon: <FiCpu /> },
  { key: 'marketing', name: 'Marketing', icon: <FiTrendingUp /> },
  { key: 'sales', name: 'Sales', icon: <FiDollarSign /> },
  { key: 'finance', name: 'Finance', icon: <FiDollarSign /> },
  { key: 'healthcare', name: 'Healthcare', icon: <FiHeart /> },
  { key: 'pharma', name: 'Pharma', icon: <FiActivity /> },
  { key: 'hr', name: 'Human Resources', icon: <FiUsers /> },
  { key: 'consulting', name: 'Consulting', icon: <FiBriefcase /> },
  { key: 'cybersecurity', name: 'Cybersecurity', icon: <FiShield /> },
  { key: 'product_management', name: 'Product Management', icon: <FiBox /> },
  { key: 'ui_ux', name: 'UI/UX Design', icon: <FiLayout /> },
  { key: 'operations', name: 'Operations', icon: <FiSettings /> },
  { key: 'customer_support', name: 'Customer Support', icon: <FiMessageSquare /> },
  { key: 'ecommerce', name: 'E-commerce', icon: <FiShoppingCart /> },
  { key: 'manufacturing', name: 'Manufacturing', icon: <FiTool /> },
  { key: 'business_analyst', name: 'Business Analyst', icon: <FiPieChart /> },
];

export default function IndustrySelector({ selected, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return INDUSTRIES;
    return INDUSTRIES.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="industry-selector">
      <h3 className="industry-title">
        <FiCpu /> What industry are you targeting?
      </h3>
      <p className="industry-subtitle">Select your target industry for tailored analysis</p>

      <div className="industry-search-wrap">
        <FiSearch className="search-icon" />
        <input
          type="text"
          className="input-field industry-search"
          placeholder="Search industries or type custom..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="industry-grid">
        <AnimatePresence>
          {filtered.map((industry, idx) => (
            <motion.button
              key={industry.key}
              className={`industry-card ${selected === industry.key ? 'selected' : ''}`}
              onClick={() => onSelect(industry.key === selected ? null : industry.key)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="industry-card-icon">{industry.icon}</span>
              <span className="industry-card-name">{industry.name}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {search && filtered.length === 0 && (
        <motion.div
          className="industry-custom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>No matching industry found. We&apos;ll use &quot;<strong>{search}</strong>&quot; as your target.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSelect(search)}
          >
            Use &quot;{search}&quot;
          </button>
        </motion.div>
      )}
    </div>
  );
}
