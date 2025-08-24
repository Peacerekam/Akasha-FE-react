export const reactSelectCustomFilterTheme = {
  menu: (provided: any, state: any) => ({
    ...provided,
    color: "white",
    backgroundColor: "#202525",
    // backg: 'black';
  }),

  menuList: (provided: any) => {
    return {
      ...provided,
      "::-webkit-scrollbar": {
        width: "6px",
        height: "0px",
      },
      "::-webkit-scrollbar-track": {
        background: "#2c2c2c",
      },
      "::-webkit-scrollbar-thumb": {
        background: "#9f9f9f",
        borderRadius: "10px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "#d1d1d1",
      },
    };
  },

  control: (provided: any, state: any) => {
    return {
      ...provided,
      color: "white",
      backgroundColor: "transparent",
      boxShadow: "none",
      border: "none",
    };
  },

  input: (provided: any) => {
    return {
      ...provided,
      color: "white",
      opacity: 0.7,
      cursor: "text",
      paddingLeft: 5,
      fontSize: 13,
    };
  },

  placeholder: (provided: any) => {
    return {
      ...provided,
      paddingLeft: 6,
      fontSize: 13,
      marginBottom: 2,
    };
  },

  valueContainer: (provided: any, state: any) => {
    return {
      ...provided,
      paddingLeft: 5,
      paddingRight: 5,
      flexWrap: "nowrap",
      cursor: "text",
    };
  },

  indicatorsContainer: (provided: any) => {
    return {
      display: "none",
    };
    // return {
    //   ...provided,
    //   span: {
    //     opacity: 0.25,
    //   },
    //   // border: '2px solid red'
    //   " > div:first-of-type": {
    //     cursor: "pointer",
    //     color: "rgba(255,255,255, 0.7)",
    //     "&:hover": {
    //       color: "rgba(255,255,255, 1)",
    //     },
    //   },
    //   " > div:last-child": {
    //     display: "none",
    //   },
    // };
  },

  // indicatorSeparator: () => {
  //   return {
  //     display: 'none'
  //   }
  // },

  multiValue: (provided: any, state: any) => {
    return {
      ...provided,
      backgroundColor: "#40839b",
      padding: "1px 4px 2px 10px",
      color: "white",
      borderRadius: "50px",
      "> div": {
        padding: 0,
      },
      "div:last-child": {
        paddingLeft: 5,
        paddingRight: 5,
        "&:hover": {
          backgroundColor: "transparent",
          cursor: "pointer",
        },
      },
    };
  },

  option: (provided: any, state: any) => {
    const style: any = {
      backgroundColor: "#202525",
      borderColor: "rgba(255,255,255, 0.3)",
      color: "white",
      position: "relative",
    };

    if (state.isFocused) {
      style.backgroundColor = "#40839b55";
      style["> span > span > span:last-child::after"] = {
        content: '"Press enter to apply"',
        position: "relative",
        // color: '#202525',
        color: "white",
        opacity: 0.2,
        fontSize: 13,
        left: 20,
      };
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
      // backgroundColor: "#202525",
      backgroundColor: "transparent",
    };
  },
};
