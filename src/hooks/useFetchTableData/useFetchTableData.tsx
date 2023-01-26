import axios from "axios";
import { useQuery } from "react-query";

type UseTableDataHookProps = {
  sort?: string;
  order?: number;
  size?: number;
  page?: number;
  filter?: string;
  uids?: string;
};

export const useFetchTableData = (
  fetchURL: string | null,
  params: UseTableDataHookProps
) => {
  const fetchData = async (): Promise<{
    data: any[];
    totalRowsHash?: string;
  }> => {
    if (!fetchURL) return { data: [] };

    const response = await axios.get(fetchURL, { params });
    const { data, totalRowsHash } = response.data;

    return {
      data,
      totalRowsHash,
    };
  };

  return useQuery({
    queryKey: ["table-data", fetchURL, params],
    // params   ========>>>   sort, order, size, page, filter, uids
    queryFn: fetchData,
    keepPreviousData: true,
  });
};
