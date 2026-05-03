import React, { useState, useEffect } from 'react';
import { OfflineWeatherAPI, type PredictionComparison } from '../services/offlineWeatherAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface PredictionComparisonProps {
  className?: string;
}

export const PredictionComparisonComponent: React.FC<PredictionComparisonProps> = ({ className }) => {
  const [comparisons, setComparisons] = useState<PredictionComparison[]>([]);
  const [metrics, setMetrics] = useState({
    avgTemperatureAccuracy: 0,
    avgHumidityAccuracy: 0,
    avgRainAccuracy: 0,
    avgOverallAccuracy: 0,
    totalPredictions: 0
  });
  const [timeRange, setTimeRange] = useState<number>(24);
  const weatherAPI = OfflineWeatherAPI.getInstance();

  useEffect(() => {
    const updateData = () => {
      const predictionHistory = weatherAPI.getPredictionHistory(timeRange);
      const accuracyMetrics = weatherAPI.getAccuracyMetrics(timeRange);
      
      setComparisons(predictionHistory.slice(0, 20)); // Show last 20 comparisons
      setMetrics(accuracyMetrics);
    };

    updateData();
    const interval = setInterval(updateData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [timeRange, weatherAPI]);

  const chartData = comparisons.map((comparison, index) => ({
    name: `P${index + 1}`,
    temperatureAccuracy: comparison.accuracy.temperatureAccuracy,
    humidityAccuracy: comparison.accuracy.humidityAccuracy,
    rainAccuracy: comparison.accuracy.rainAccuracy || 0,
    overallAccuracy: comparison.accuracy.overallAccuracy,
    time: comparison.timestamp.toLocaleTimeString()
  }));

  const pieData = [
    { name: 'Temperature', value: metrics.avgTemperatureAccuracy, color: '#3B82F6' },
    { name: 'Humidity', value: metrics.avgHumidityAccuracy, color: '#10B981' },
    { name: 'Rain', value: metrics.avgRainAccuracy, color: '#F59E0B' },
    { name: 'Overall', value: metrics.avgOverallAccuracy, color: '#8B5CF6' }
  ];

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (accuracy >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prediction Accuracy Analysis
          </h2>
          <div className="flex gap-2">
            {[1, 6, 24, 72].map(hours => (
              <button
                key={hours}
                onClick={() => setTimeRange(hours)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeRange === hours
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {hours === 1 ? '1H' : hours === 6 ? '6H' : hours === 24 ? '24H' : '72H'}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Temperature Accuracy</span>
              {getAccuracyIcon(metrics.avgTemperatureAccuracy)}
            </div>
            <div className={`text-2xl font-bold ${getAccuracyColor(metrics.avgTemperatureAccuracy)}`}>
              {metrics.avgTemperatureAccuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {metrics.totalPredictions} predictions
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Humidity Accuracy</span>
              {getAccuracyIcon(metrics.avgHumidityAccuracy)}
            </div>
            <div className={`text-2xl font-bold ${getAccuracyColor(metrics.avgHumidityAccuracy)}`}>
              {metrics.avgHumidityAccuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-green-600 mt-1">
              Humidity predictions
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-700">Rain Accuracy</span>
              {getAccuracyIcon(metrics.avgRainAccuracy)}
            </div>
            <div className={`text-2xl font-bold ${getAccuracyColor(metrics.avgRainAccuracy)}`}>
              {metrics.avgRainAccuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-amber-600 mt-1">
              Rain predictions
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Overall Accuracy</span>
              {getAccuracyIcon(metrics.avgOverallAccuracy)}
            </div>
            <div className={`text-2xl font-bold ${getAccuracyColor(metrics.avgOverallAccuracy)}`}>
              {metrics.avgOverallAccuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Combined metrics
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total Predictions</span>
              <Activity className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.totalPredictions}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Last {timeRange} hours
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Accuracy Trends */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Accuracy Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  labelFormatter={(label) => `Prediction ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperatureAccuracy" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Temperature"
                />
                <Line 
                  type="monotone" 
                  dataKey="humidityAccuracy" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Humidity"
                />
                <Line 
                  type="monotone" 
                  dataKey="rainAccuracy" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Rain"
                />
                <Line 
                  type="monotone" 
                  dataKey="overallAccuracy" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Overall"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Accuracy Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Average Accuracy Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Comparisons Table */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Recent Prediction Comparisons</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temp Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Humidity Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rain Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisons.slice(0, 10).map((comparison, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {comparison.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {comparison.actual.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getAccuracyColor(comparison.accuracy.temperatureAccuracy)}`}>
                          {comparison.accuracy.temperatureAccuracy.toFixed(1)}%
                        </span>
                        {index > 0 && getTrendIcon(
                          comparison.accuracy.temperatureAccuracy,
                          comparisons[index - 1].accuracy.temperatureAccuracy
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getAccuracyColor(comparison.accuracy.humidityAccuracy)}`}>
                          {comparison.accuracy.humidityAccuracy.toFixed(1)}%
                        </span>
                        {index > 0 && getTrendIcon(
                          comparison.accuracy.humidityAccuracy,
                          comparisons[index - 1].accuracy.humidityAccuracy
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getAccuracyColor(comparison.accuracy.rainAccuracy || 0)}`}>
                          {(comparison.accuracy.rainAccuracy || 0).toFixed(1)}%
                        </span>
                        {index > 0 && getTrendIcon(
                          comparison.accuracy.rainAccuracy || 0,
                          comparisons[index - 1].accuracy.rainAccuracy || 0
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getAccuracyColor(comparison.accuracy.overallAccuracy)}`}>
                          {comparison.accuracy.overallAccuracy.toFixed(1)}%
                        </span>
                        {index > 0 && getTrendIcon(
                          comparison.accuracy.overallAccuracy,
                          comparisons[index - 1].accuracy.overallAccuracy
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {comparisons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No prediction comparisons available</p>
                <p className="text-sm">Comparisons will appear as predictions are made</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
