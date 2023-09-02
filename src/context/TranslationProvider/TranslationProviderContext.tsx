import React, { useState, createContext, useEffect, useCallback } from "react";
import axios from "axios";

export type Language =
  | "en"
  | "ru"
  | "vi"
  | "th"
  | "pt"
  | "ko"
  | "ja"
  | "id" // id is not real, it can't hurt you
  | "fr"
  | "es"
  | "de"
  | "zh-TW"
  | "zh-CN"
  | "it"
  | "tr";

export const languages: Language[] = [
  "en",
  "ru",
  "vi",
  "th",
  "pt",
  "ko",
  "ja",
  // "id",
  "fr",
  "es",
  "de",
  "zh-TW",
  "zh-CN",
  "it",
  "tr",
];

export const KEY_TO_FULL: Record<Language, string> = {
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
  "zh-CN": "한국어",
  "zh-TW": "繁體中文",
};

type Hashmap = { [key: string]: string };
type TextMap = Record<Language, Hashmap>;

type TranslationProviderContextType = {
  translate: (word: string) => string;
  setLanguage: (title: Language) => void;
  language: Language;
};

const defaultValue = {
  translate: () => "",
  setLanguage: () => {},
  language: "en",
} as TranslationProviderContextType;

const TranslationContext = createContext(defaultValue);

const TranslationContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");
  const [textMap, setTextMap] = useState<Partial<TextMap>>({});

  const hasNewKeys = (oldObj: Hashmap = {}, newObj: Hashmap = {}) => {
    for (const key of Object.keys(newObj)) {
      if (!oldObj[key]) return true;
    }
    return false;
  };

  const getTranslation = useCallback(
    async (requestedWords: Hashmap) => {
      try {
        const requestHasNewTranslations = hasNewKeys(
          textMap[language],
          requestedWords
        );

        if (!requestHasNewTranslations) {
          (window as any).tnQueue = {};
          return;
        }

        const words = Array.from(new Set(Object.keys(requestedWords)));
        const fetchURL = `/api/textmap/${language}`;
        const opts = { params: { words } };
        const { data } = await axios.get(fetchURL, opts);

        const responseHasNewTranslations = hasNewKeys(
          textMap[language],
          data.translation
        );

        if (responseHasNewTranslations) {
          setTextMap((prev) => ({
            ...prev,
            [language]: {
              ...requestedWords,
              ...prev[language],
              ...data.translation,
            },
          }));
          console.log(
            `[Akasha-${language}] Fetched ${
              Object.keys(data.translation).length
            } new translation(s)`
          );
        }

        (window as any).tnQueue = {};
      } catch (err) {
        console.log(err);
        (window as any).tnQueue = {};
      }
    },
    [language, textMap]
  );

  useEffect(() => {
    const textMapFromLS = JSON.parse(localStorage.getItem("textMap") ?? "{}");
    setTextMap(textMapFromLS);

    const detectedLanguage = languages.includes(navigator?.language as any)
      ? navigator?.language
      : "en";

    const languageFromLS = localStorage.getItem("language") ?? detectedLanguage;
    setLanguage(languageFromLS as Language);
  }, []);

  useEffect(() => {
    localStorage.setItem("textMap", JSON.stringify(textMap));
  }, [textMap]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    const pooling = setInterval(() => {
      const tnQueue = (window as any).tnQueue || {};
      if (Object.keys(tnQueue)?.length > 0) {
        getTranslation(tnQueue);
      }
    }, 500);

    return () => clearInterval(pooling);
  }, [language, (window as any).tnQueue]);

  const addToQueue = useCallback((word: string) => {
    if (!(window as any).tnQueue) (window as any).tnQueue = {};
    (window as any).tnQueue[word] = "NO_TRANSLATION";
  }, []);

  const translate = useCallback(
    (word: string) => {
      if (language === "en") return word;

      if (!textMap[language]) {
        textMap[language] = {};
      }

      const matchedTranslation = textMap[language]?.[word.toLowerCase()];
      if (matchedTranslation) {
        if (matchedTranslation === "NO_TRANSLATION") {
          return word;
        }
        return matchedTranslation || "";
      }

      // console.log(word);
      addToQueue(word);
      return word;
    },
    [language, textMap]
  );

  const value = {
    translate,
    setLanguage,
    language,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export { TranslationContext, TranslationContextProvider };
