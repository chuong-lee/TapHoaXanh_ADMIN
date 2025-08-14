import api from "@/app/lib/axios";
import { useEffect, useState, useCallback } from "react";

// Hook chung để GET dữ liệu
function useFetch<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err);
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, loading, error, refetch: fetchData };
}

export default useFetch;
