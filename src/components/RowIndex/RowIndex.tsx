type ARBadgeProps = {
  index: number | string;
};

export const RowIndex: React.FC<ARBadgeProps> = ({ index }) => {
  if (index !== +index) {
    const _index = ("" + index).slice(1);

    return (
      <div
        style={{
          color: "orange",
          transform: `rotate(${+(Math.random() * 20).toFixed(0) - 10}deg)`,
        }}
      >
        {_index}
      </div>
    );
  }

  return <span>{index}</span>;
};
