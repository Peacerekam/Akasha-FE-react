export type TableColumn<T> = {
  name?: string | number | React.ReactNode;
  sortField?: string;
  sortable?: boolean;
  width?: string;
  cell?: (row: T, rowIndex: number) => React.ReactNode;
};
