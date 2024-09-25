type ARBadgeProps = {
  index: number | string;
};

export const RowIndex: React.FC<ARBadgeProps> = ({ index }) => {
  if (index !== +index) {
    return (
      <div
        style={{
          color: "orange",
          transform: `rotate(${+(Math.random() * 60).toFixed(0) - 30}deg)`,
        }}
      >
        {index}
      </div>
    );
  }

  return <span>{index}</span>;
};
