import React from "react";
import { StatIcon } from "../StatIcon";
import "./style.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { ELEMENT_TO_COLOR } from "../CharacterCard";
import FlexIcon from "../../assets/icons/world-quest.webp";

export type Elements =
  | "Cryo"
  | "Anemo"
  | "Dendro"
  | "Geo"
  | "Pyro"
  | "Hydro"
  | "Electro";

export type CalculationTeammate = {
  character?: {
    rarity?: "5" | "4";
    element?: Elements;
    name?: string;
    icon?: string;
    constellation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  };
  weapon?: {
    name?: string;
    rarity?: "5" | "4" | "3";
    icon?: string;
    refinement?: 1 | 2 | 3 | 4 | 5;
  };
};

type TeammatesCompactProps = {
  teammates?: CalculationTeammate[];
  scale?: number;
};

const getCharacterTitle = (teammate: CalculationTeammate) => {
  const constellation =
    (teammate?.character?.constellation || -1) >= 0
      ? ` C${teammate?.character?.constellation}`
      : "";

  const weaponName = teammate.weapon?.name ? ` - ${teammate.weapon?.name}` : "";

  const weaponRefinement =
    (teammate?.weapon?.refinement || 0) >= 1
      ? ` R${teammate?.weapon?.refinement}`
      : "";

  return `${teammate.character?.name}${constellation}${weaponName}${weaponRefinement}`;
};

const getBgColor = (teammate: CalculationTeammate) => {
  if (!teammate.character) return ["transparent"];

  const elementColor = ELEMENT_TO_COLOR[teammate?.character?.element || ""];

  if (!teammate.character.rarity) {
    const col = elementColor || "gray";
    return ["rgb(81, 81, 81)", col, `${col}85`];

    // const col =
    //   ELEMENT_TO_COLOR[teammate?.character?.element || ""] || "transparent";

    // return teammate.character?.element
    //   ? [`${col}95`, col]
    //   : ["rgb(61, 61, 61)", "gray"];
  }

  if (teammate?.character?.element) {
    const col = elementColor || "transparent";
    return [`${ELEMENT_TO_COLOR[teammate?.character?.element]}95`, col];
  }

  const colorsByRarity = {
    "5": "#BF8C40",
    "4": "#9F74AA",
  }[teammate.character.rarity];

  return [colorsByRarity, "transparent"];
};

export const TeammatesCompact: React.FC<TeammatesCompactProps> = ({
  teammates,
  scale = 1,
}) => {
  if (!teammates) return null;

  const noTeammateIcon = () => {
    return (
      <div className="no-teammate-fill-img">
        <FontAwesomeIcon
          icon={faXmark}
          size={`${Math.round(scale)}x` as SizeProp}
        />
      </div>
    );
  };

  const flexTeammateIcon = (teammate: CalculationTeammate) => {
    return <img className="flex-fill-img" src={FlexIcon} />;
  };

  const teammateIcon = (teammate: CalculationTeammate) => {
    return <img className="table-icon" src={teammate.character?.icon} />;
  };

  const renderTeammate = (teammate: CalculationTeammate, index: number) => {
    console.log("\n", teammate.character, teammate.weapon);

    const isEmpty = teammate.character?.name === "x";
    const isFlex = teammate.character?.name === "Flex";
    const isNonFill = teammate.character?.icon;

    let innerElement = <></>;
    let title = "";

    if (isEmpty) {
      title = `No teammate`;
      innerElement = noTeammateIcon();
    } else if (isFlex) {
      title = `Any teammate`;
      innerElement = flexTeammateIcon(teammate);
    } else if (isNonFill) {
      title = getCharacterTitle(teammate);
      innerElement = teammateIcon(teammate);
    } else {
      title = `Any ${teammate.character?.element} teammate`;
      innerElement = <StatIcon name={teammate.character?.element || ""} />;
    }

    const teammateStyle = {
      "--teammate-background": getBgColor(teammate)[0],
      "--teammate-border": getBgColor(teammate)[1],
      "--teammate-inner-shadow": getBgColor(teammate)[2] || "transparent",
    } as React.CSSProperties;

    return (
      <div
        key={`teammate-${index}`}
        title={title}
        className="teammate-wrapper"
        style={teammateStyle}
      >
        {innerElement}
        <div className="teammate-bg" />
      </div>
    );
  };

  const teamDisplayStyle = {
    "--teammate-scale": scale,
  } as React.CSSProperties;

  return (
    <div className="team-display" style={teamDisplayStyle}>
      {teammates.map(renderTeammate)}
    </div>
  );
};
