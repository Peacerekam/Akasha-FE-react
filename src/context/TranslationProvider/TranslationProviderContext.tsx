import React, { createContext, useCallback, useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

import { TRANSLATION_VERSION } from "../../utils/maybeEnv";

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

type Hashmap = { [key: string]: string };
type TextMap = Record<Language, Hashmap>;

type TranslationProviderContextType = {
  translate: (word: string, gender?: "M" | "F") => string;
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

  const lsKeyTextMap = "textMap";
  const lsKeyLanguage = "language";
  const NO_TRANSLATION_STRING = `NO_TRANSLATION_${TRANSLATION_VERSION}`;

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
        const opts: AxiosRequestConfig<any> = { params: { words } };
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
              Object.keys(data?.translation || {}).length
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
    const textMapFromLS = JSON.parse(
      localStorage.getItem(lsKeyTextMap) ?? "{}"
    );

    let outdated = false;
    for (const language of Object.keys(textMapFromLS)) {
      for (const key of Object.keys(textMapFromLS[language])) {
        outdated =
          textMapFromLS[language][key].startsWith("NO_TRANSLATION") &&
          textMapFromLS[language][key] !== NO_TRANSLATION_STRING;
        if (outdated) break;
      }
      if (outdated) break;
    }

    if (outdated) {
      console.log(`[${language}] New translation version detected`);
      setTextMap({});
    } else {
      console.log(
        `Loading translation from local storage`
      );
      setTextMap(textMapFromLS);
    }

    let navigatorLanguage: any = navigator?.language;

    const isNonChina =
      !navigatorLanguage?.startsWith("zh") && navigatorLanguage?.includes("-");

    if (isNonChina) navigatorLanguage = navigatorLanguage.split("-")[0];

    const languageNotDefined = !languages.includes(navigatorLanguage);
    const defaultLangauge = navigatorLanguage?.startsWith("zh")
      ? "zh-CN"
      : "en";

    const detectedLanguage = languageNotDefined
      ? defaultLangauge
      : navigatorLanguage;

    const languageFromLS =
      localStorage.getItem(lsKeyLanguage) ?? detectedLanguage;
    setLanguage(languageFromLS as Language);
  }, []);

  useEffect(() => {
    localStorage.setItem(lsKeyTextMap, JSON.stringify(textMap));
  }, [textMap]);

  useEffect(() => {
    localStorage.setItem(lsKeyLanguage, language);
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
    (window as any).tnQueue[word] = NO_TRANSLATION_STRING;
  }, []);

  const translate = useCallback(
    (word: string, gender?: "M" | "F") => {
      if (language === "en") return word;

      if (!textMap[language]) {
        textMap[language] = {};
      }

      const matchedTranslation = textMap[language]?.[word.toLowerCase()];
      if (matchedTranslation) {
        if (matchedTranslation === NO_TRANSLATION_STRING) {
          return word;
        }

        if (gender) {
          // maybe one day i will properly fix it
          /* eslint-disable no-useless-escape */
          return matchedTranslation
            .replace(/^#/, "")
            .replace(/\{([^#]+)#([^\}]+)\}/g, (_, $1, $2) =>
              $1 === gender ? $2 : ""
            );
          /* eslint-enable no-useless-escape */
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
