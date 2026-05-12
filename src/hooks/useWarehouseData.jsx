'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useWarehouseData = (selectedDate) => {
  const [warehouseStats, setWarehouseStats] = useState({});
  const [unregisteredStats, setUnregisteredStats] = useState({});
  const [summary, setSummary] = useState({
    activeWarehouses: 0,
    totalQueues: 0,
    totalFinishedLoading: 0,
    totalFinishedUnloading: 0,
    totalLifetimeLoading: 0,
    totalLifetimeUnloading: 0,
    totalActiveReports: 0,
    avgProcessTime: 0,
    totalCapacity: 0,
    totalActual: 0,
    totalOccupancy: 0
  });
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isHistorical, setIsHistorical] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [error, setError] = useState(null);

  const parseNum = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/,/g, '')) || 0;
  };

  const fetchHistoricalData = async (date) => {
    setIsFetchingHistory(true);
    setError(null);
    try {
      const res = await fetch(`/api/historical-stats?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch historical data');
      const data = await res.json();
      setWarehouseStats(data.registered || {});
      setUnregisteredStats(data.unregistered || {});
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('History fetch error:', err);
      setError(err.message);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const fetchCurrentStats = async () => {
    setError(null);
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch real-time stats');
      const data = await res.json();
      if (data) {
        setWarehouseStats(data.registered || {});
        setUnregisteredStats(data.unregistered || {});
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) {
      setIsHistorical(true);
      fetchHistoricalData(selectedDate);
    } else {
      setIsHistorical(false);
      fetchCurrentStats();
    }
  }, [selectedDate]);

  useEffect(() => {
    const socket = io();
    
    socket.on('stats_updated', (data) => {
      if (!data || !data.id || isHistorical) return;
      setWarehouseStats(prev => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          ...data,
          stats: data.stats || prev[data.id]?.stats,
          lifetime: data.lifetime?.loading ? data.lifetime : prev[data.id]?.lifetime,
          last_update: new Date()
        }
      }));
    });

    socket.on('warehouse_status_changed', (data) => {
      if (!data || !data.id || isHistorical) return;
      setWarehouseStats(prev => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          ...data,
          stats: data.stats || prev[data.id]?.stats,
          lifetime: data.lifetime?.loading ? data.lifetime : prev[data.id]?.lifetime,
          last_update: new Date()
        }
      }));
    });

    socket.on('occupancy_updated', (data) => {
      if (!data || isHistorical) return;
      
      setWarehouseStats(prev => {
        const newRegistered = data.registered || {};
        const merged = { ...newRegistered };
        
        // Preserve existing stats if the new object has null/missing stats
        Object.keys(merged).forEach(id => {
          if (prev[id] && (!merged[id].stats || Object.keys(merged[id].stats).length === 0)) {
            merged[id] = {
              ...merged[id],
              stats: prev[id].stats,
              lifetime: merged[id].lifetime || prev[id].lifetime,
              last_update: merged[id].last_update || prev[id].last_update
            };
          } else if (prev[id]) {
             // Deeply merge stats to be safe
             merged[id].stats = { ...prev[id].stats, ...merged[id].stats };
          }
        });
        
        return merged;
      });

      setUnregisteredStats(data.unregistered || {});
      setLastRefreshed(new Date());
    });

    socket.on('report_count_updated', (data) => {
      if (!data || !data.warehouse_id || isHistorical) return;
      setWarehouseStats(prev => {
        if (!prev[data.warehouse_id]) return prev;
        return {
          ...prev,
          [data.warehouse_id]: {
            ...prev[data.warehouse_id],
            active_reports: data.count
          }
        };
      });
    });

    return () => socket.close();
  }, [isHistorical]);

  useEffect(() => {
    let queues = 0;
    let finishedLoading = 0;
    let finishedUnloading = 0;
    let lifetimeLoading = 0;
    let lifetimeUnloading = 0;
    let activeReports = 0;
    let active = 0;
    let processTime = 0;
    let capacity = 0;
    let actual = 0;
    let count = 0;

    Object.entries(warehouseStats).forEach(([id, w]) => {
      if (!w) return;
      const stats = w.stats || {};
      
      if (isHistorical) {
        if ((stats.finished_muat_today || 0) > 0 || (stats.finished_bongkar_today || 0) > 0) active++;
      } else {
        if (w.status === 'online') active++;
      }
      queues += (stats.muat_waiting || 0) + (stats.bongkar_waiting || 0) + (stats.muat_processing || 0) + (stats.bongkar_processing || 0);
      finishedLoading += (stats.finished_muat_today || 0);
      finishedUnloading += (stats.finished_bongkar_today || 0);
      lifetimeLoading += (w.lifetime?.loading || 0);
      lifetimeUnloading += (w.lifetime?.unloading || 0);
      activeReports += (w.active_reports || 0);
      if (stats.avg_waiting > 0) { processTime += stats.avg_waiting; count++; }

      // Capacity and Actual Stock
      capacity += parseNum(w.capacity);
      actual += parseNum(w.actual);
    });

    Object.values(unregisteredStats).forEach(w => {
      if (!w) return;
      capacity += parseNum(w.capacity);
      actual += parseNum(w.actual);
    });

    setSummary({
      activeWarehouses: active,
      totalQueues: queues,
      totalFinishedLoading: finishedLoading,
      totalFinishedUnloading: finishedUnloading,
      totalLifetimeLoading: lifetimeLoading,
      totalLifetimeUnloading: lifetimeUnloading,
      totalActiveReports: activeReports,
      avgProcessTime: count > 0 ? Math.round(processTime / count) : 0,
      totalCapacity: capacity,
      totalActual: actual,
      totalOccupancy: capacity > 0 ? Math.round((actual / capacity) * 100) : 0
    });
  }, [warehouseStats, unregisteredStats, isHistorical]);

  return {
    warehouseStats,
    unregisteredStats,
    summary,
    lastRefreshed,
    isHistorical,
    isFetchingHistory,
    error,
    fetchCurrentStats,
    setWarehouseStats,
    setUnregisteredStats
  };
};
