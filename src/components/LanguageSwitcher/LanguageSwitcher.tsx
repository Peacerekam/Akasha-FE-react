import React, { useContext, useRef } from "react";
import {
  KEY_TO_FULL,
  TranslationContext,
  languages,
} from "../../context/TranslationProvider/TranslationProviderContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import "./style.scss";

export const LanguageSwitcher: React.FC = () => {
  const { setLanguage, language } = useContext(TranslationContext);
  const dropdownRef = useRef<HTMLAnchorElement>(null);

  const languageList = languages.map((name) => (
    <div
      className={language === name ? "current-langauge" : ""}
      key={name}
      onMouseDown={() => {
        setLanguage(name);
        dropdownRef?.current?.blur();
      }}
    >
      {KEY_TO_FULL[name]}
    </div>
  ));

  return (
    <div className="language-switcher">
      <a
        ref={dropdownRef}
        href=""
        onMouseDown={(e) => {
          const isMain =
            dropdownRef?.current === e.target ||
            dropdownRef?.current?.contains(e.target as Node);
          if (!isMain) return;

          const isActive = dropdownRef?.current === document.activeElement;
          if (!isActive) return;

          setTimeout(() => dropdownRef?.current?.blur(), 0);
        }}
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <FontAwesomeIcon icon={faGlobe} size="1x" /> {language.toUpperCase()}
        <div className="language-dropdown">{languageList}</div>
      </a>
    </div>
  );
};
