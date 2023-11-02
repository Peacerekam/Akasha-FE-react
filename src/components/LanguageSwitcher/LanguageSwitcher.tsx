import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
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
  // const { screenWidth } = useContext(AdProviderContext);
  const { setLanguage, language } = useContext(TranslationContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        window.addEventListener("click", handleClose);
      }, 0);
    } else {
      window.removeEventListener("click", handleClose);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      window.removeEventListener("click", handleClose);
    };
  }, []);

  const languageList = reorderedLanguages.map((name) => (
    <div
      className={language === name ? "current-langauge" : ""}
      key={name}
      onClick={() => {
        setLanguage(name);
        setIsOpen(false);
      }}
    >
      {KEY_TO_FULL[name]}
    </div>
  ));

  return (
    <div className="language-switcher">
      <a
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <FontAwesomeIcon icon={faGlobe} size="1x" /> {language.toUpperCase()}
      </a>
      {isOpen && <div className="language-dropdown">{languageList}</div>}
    </div>
  );
};
