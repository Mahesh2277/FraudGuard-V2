import { useState, useEffect } from "react";
import AnalyticsCharts from "./AnalyticsCharts";

const TransactionTable = () => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    payerId: "",
    payeeId: "",
    transactionId: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    fraudulentTransactions: 0,
    fraudRate: 0
  });
  const [view, setView] = useState('table'); // 'table' or 'analytics'

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        payerId: filters.payerId,
        payeeId: filters.payeeId,
        transactionId: filters.transactionId,
        page: pagination.page,
        limit: pagination.limit
      });

      const response = await fetch(`http://localhost:5000/api/transactions?${queryParams}`);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
      }
      
      const data = await response.json();
      
      setTransactions(data.data.transactions);
      setColumns(data.data.columns);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions on initial load
  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  const handleChange = (e) => {
    const id = e.target.id.charAt(0).toLowerCase() + e.target.id.slice(1); // Convert PayerId to payerId
    setFilters({ ...filters, [id]: e.target.value });
  };

  const handleApplyFilters = async () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    await fetchTransactions();
  };

  const handleReset = async () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      payerId: "",
      payeeId: "",
      transactionId: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    await fetchTransactions();
  };

  const handlePageChange = async (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    await fetchTransactions();
  };

  return (
    <div className="page-section h-full py-6 px-6">
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTransactions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${(stats.totalAmount || 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fraudulent Transactions</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.fraudulentTransactions}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fraud Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.fraudRate ? stats.fraudRate.toFixed(2) : '0.00'}%</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Transaction Data
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-md ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`px-4 py-2 rounded-md ${view === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Analytics
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          View and analyze raw transaction data with fraud prediction and
          reporting information.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                id="dateFrom"
                className="w-full rounded-md border px-3 py-2 text-sm"
                onChange={handleChange}
              />
              <input
                type="date"
                id="dateTo"
                className="w-full rounded-md border px-3 py-2 text-sm"
                onChange={handleChange}
              />
            </div>
          </div>

          {["PayerId", "PayeeId", "TransactionId"].map((filter) => (
            <div key={filter}>
              <label
                htmlFor={filter}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {filter.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                id={filter}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder={`Enter ${filter}`}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        {view === 'table' && (
          <div className="flex justify-end space-x-3 mb-6">
            <button 
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={handleReset}
            >
              Reset
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              onClick={() => {
                const csvContent = [
                  columns.map(col => col.label).join(','),
                  ...transactions.map(txn => columns.map(col => txn[col.key]).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'transactions.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export CSV
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Show loading state */}
        {loading && (
          <div className="text-center py-4">
            Loading...
          </div>
        )}

        {/* Conditional rendering based on view */}
        {view === 'table' ? (
          <>
            {/* Modified Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={`${txn.id}-${column.key}`} className="px-6 py-4">
                          {column.type === 'status' ? (
                            <span
                              className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                                txn[column.key] === "Yes"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {txn[column.key]}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {txn[column.key]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Update Pagination section */}
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span> of{" "}
                <span className="font-medium">{pagination.total}</span> results
              </p>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <button 
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <AnalyticsCharts />
        )}
      </div>
    </div>
  );
};

export default TransactionTable;