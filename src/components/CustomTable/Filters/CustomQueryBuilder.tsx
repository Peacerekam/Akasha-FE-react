import { FilterOption, OptionsResponse } from "./FiltersContainer";
import ReactSelect, { MultiValue } from "react-select";
import { StatIcon, isIcon } from "../../StatIcon";
import { useContext, useMemo, useState } from "react";

import { AssetFallback } from "../../AssetFallback";
import Highlighter from "react-highlight-words";
import { TranslationContext } from "../../../context/TranslationProvider/TranslationProviderContext";
import { getGenderFromIcon } from "../../../utils/helpers";
import { reactSelectCustomFilterTheme } from "../../../utils/reactSelectCustomFilterTheme";

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
  const { translate } = useContext(TranslationContext);

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

              const gender = getGenderFromIcon(opt.icon);
              const translatedName = opt.name
                .split(" - ")
                .map((x) => translate(x, gender))
                .join(" - ");

              return {
                label: (
                  <span className="react-select-custom-option">
                    {opt.icon || isStatIcon ? (
                      <>
                        {isStatIcon ? (
                          <StatIcon name={iconName ?? ""} />
                        ) : (
                          <AssetFallback alt="" src={opt.icon} />
                        )}
                        <Highlighter
                          highlightClassName="text-highlight-class"
                          searchWords={[textInput]}
                          autoEscape={true}
                          textToHighlight={`${prefix}${translatedName}`}
                        />
                      </>
                    ) : (
                      <Highlighter
                        highlightClassName="text-highlight-class"
                        searchWords={[textInput]}
                        autoEscape={true}
                        textToHighlight={`${prefix}${translatedName}`}
                      />
                    )}
                  </span>
                ),
                rawLabel: `${prefix}${translatedName}`,
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
    [optionGroups, textInput, translate]
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
