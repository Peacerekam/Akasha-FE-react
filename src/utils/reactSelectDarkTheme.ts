export const darkTheme = {
  menu: (provided: any, state: any) => ({
    ...provided,
    color: "white",
    backgroundColor: "#202525",
    // backg: 'black';
  }),

  control: (provided: any, state: any) => {
    return {
      ...provided,
      color: "white",
      backgroundColor: "#202525",
      borderColor: state.isFocused ? "#40839bbb" : "rgba(255,255,255, 0.3)",
      boxShadow: state.isFocused ? "0 0 0 1px #40839bbb" : "",
      "&:hover": {
        borderColor: state.isFocused ? "#40839b" : "rgba(255,255,255, 0.3)",
        boxShadow: state.isFocused ? "0 0 0 1px #40839b" : "",
      },
    };
  },

  input: (provided: any) => {
    return {
      ...provided,
      color: "white",
      opacity: 0.7,
    };
  },

  option: (provided: any, state: any) => {
    const style: any = {
      backgroundColor: "#202525",
      borderColor: "rgba(255,255,255, 0.3)",
      color: "white",
    };

    if (state.isFocused) {
      style.backgroundColor = "#40839b55";
    }
    if (state.isSelected) {
      style.backgroundColor = "#40839b";
    }

    return {
      ...provided,
      ...style,
    };
  },

  singleValue: (provided: any, state: any) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 300ms";

    return {
      ...provided,
      opacity,
      transition,
      color: "white",
      backgroundColor: "#202525",
    };
  },
};
