import React, { useState, useEffect } from 'react';

const AnalyticsCharts = () => {
  const [analyticsData, setAnalyticsData] = useState({
    fraudByState: [],
    fraudByChannel: [],
    fraudTrend: [],
    amountDistribution: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fraud by State Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fraud by State</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading analytics...</div>
        ) : (
          <div className="space-y-3">
            {analyticsData.fraudByState && analyticsData.fraudByState.length > 0 ? (
              analyticsData.fraudByState.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">{item._id}</div>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-red-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${(item.count / Math.max(...analyticsData.fraudByState.map(i => i.count))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{item.count}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
        )}
      </div>

      {/* Fraud by Payment Channel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fraud by Payment Channel</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading analytics...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analyticsData.fraudByChannel && analyticsData.fraudByChannel.length > 0 ? (
              analyticsData.fraudByChannel.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{item.count}</div>
                  <div className="text-sm text-gray-600 mt-1">{item._id}</div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
        )}
      </div>

      {/* Fraud Trend (Last 7 Days) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fraud Trend (Last 7 Days)</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading analytics...</div>
        ) : (
          <div className="flex items-end justify-between h-40 px-4">
            {analyticsData.fraudTrend && analyticsData.fraudTrend.length > 0 ? (
              analyticsData.fraudTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ 
                      height: `${(item.count / Math.max(...analyticsData.fraudTrend.map(i => i.count))) * 100}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-xs font-medium text-gray-900">{item.count}</div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
        )}
      </div>

      {/* Amount Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Amount Distribution</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading analytics...</div>
        ) : (
          <div className="space-y-3">
            {analyticsData.amountDistribution && analyticsData.amountDistribution.length > 0 ? (
              analyticsData.amountDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-40 text-sm text-gray-600">{item._id}</div>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${(item.count / Math.max(...analyticsData.amountDistribution.map(i => i.count))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{item.count}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
