import { useMemo, useState } from "react";
import ReactSelect, { MultiValue } from "react-select";
import Highlighter from "react-highlight-words";
import { reactSelectCustomFilterTheme } from "../../../utils/reactSelectCustomFilterTheme";
import { isIcon, StatIcon } from "../../StatIcon";
import { OptionsResponse, FilterOption } from "./FiltersContainer";

type CustomQueryBuilderProps = {
  optionGroups: OptionsResponse;
  handleReplaceFilter: (filters: FilterOption[]) => void;
  pills: FilterOption[];
};

export type CustomOptionGroup = {
  label: string;
  options: {
    label: JSX.Element;
    rawLabel: string;
    value: string | number;
    fieldKey: string;
  }[];
};

export const CustomQueryBuilder = ({
  optionGroups,
  handleReplaceFilter,
  pills,
}: CustomQueryBuilderProps) => {
  const [textInput, setTextInput] = useState("");

  const fieldKeyOptions = useMemo(
    () =>
      optionGroups
        .map((o, i) => {
          return {
            // index: i,
            label: o.fieldName,
            options: o.options.map((opt) => {
              const iconName = opt.name?.split(" - ")[0];
              const isStatIcon = isIcon(iconName);

              const prefix =
                {
                  "artifactSets.$1": "1p ",
                  "artifactSets.$2": "2p ",
                  "artifactSets.$4": "4p ",
                }[o.fieldKey] ?? "";

              return {
                label: (
                  <span className="react-select-custom-option">
                    {opt.icon || isStatIcon ? (
                      <>
                        {isStatIcon ? (
                          <StatIcon name={iconName ?? ""} />
                        ) : (
                          <img src={opt.icon} />
                        )}
                        <Highlighter
                          highlightClassName="text-highlight-class"
                          searchWords={[textInput]}
                          autoEscape={true}
                          textToHighlight={`${prefix}${opt.name}`}
                        />
                      </>
                    ) : (
                      <Highlighter
                        highlightClassName="text-highlight-class"
                        searchWords={[textInput]}
                        autoEscape={true}
                        textToHighlight={`${prefix}${opt.name}`}
                      />
                    )}
                  </span>
                ),
                rawLabel: `${prefix}${opt.name}`,
                value: opt.value,
                fieldKey: o.fieldKey,
              };
            }),
          };
        })
        .reduce((acc, val) => {
          const index = acc.findIndex((x) => x.label === val.label);
          if (index === -1) return [...acc, val];
          acc[index].options.push(...val.options);
          return acc;
        }, [] as CustomOptionGroup[]),
    [optionGroups, textInput]
  );

  const selectedOptions = useMemo(() => {
    const allOpts = fieldKeyOptions.reduce((acc: any, val) => {
      const arr = acc.concat(val.options);
      return arr;
    }, []);

    return pills.map((pill) => {
      const option = allOpts.find((opt: any) => {
        const compA = opt.value === "" + pill.value;
        const compB = opt.fieldKey === pill.name;
        return compA && compB;
      });
      return option;
    });
  }, [JSON.stringify(pills), fieldKeyOptions]);

  const handleChange = (options: MultiValue<any>) => {
    const filters = options.map((o) => ({
      name: o.fieldKey ?? "",
      value: o.value,
    }));
    handleReplaceFilter(filters);
  };

  return (
    <div className="custom-query-builder-wrapper">
      <ReactSelect
        isMulti
        options={fieldKeyOptions}
        menuPortalTarget={document.body}
        styles={reactSelectCustomFilterTheme}
        maxMenuHeight={450}
        getOptionValue={(option: any) => option.rawLabel}
        placeholder="no filters"
        value={selectedOptions}
        defaultValue={selectedOptions}
        onInputChange={(value) => setTextInput(value)}
        onChange={(options) => {
          if (!options) return;
          handleChange(options);
        }}
      />
    </div>
  );
};
