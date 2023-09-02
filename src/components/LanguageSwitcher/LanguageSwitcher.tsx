import React, { useContext, useRef } from "react";
import {
  Language,
  TranslationContext,
  languages,
} from "../../context/TranslationProvider/TranslationProviderContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import "./style.scss";

const KEY_TO_FULL: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  id: "Bahasa Indonesia",
  it: "Italiano",
  ja: "日本語",
  pt: "Português",
  ru: "Русский",
  th: "ภาษาไทย",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  ko: "한국어",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
};

const reorderedLanguages = [
  "en" as Language,
  ...languages.filter((x) => x !== "en").sort((a, b) => (a > b ? 1 : -1)),
];

export const LanguageSwitcher: React.FC = () => {
  const { setLanguage, language } = useContext(TranslationContext);
  const dropdownRef = useRef<HTMLAnchorElement>(null);

  const languageList = reorderedLanguages.map((name) => (
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
