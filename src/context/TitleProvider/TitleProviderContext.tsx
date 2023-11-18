import React, { createContext, useEffect, useState } from "react";

import { IS_PRODUCATION } from "../../utils/maybeEnv";
import { useLocation } from "react-router-dom";

type TitleProviderContextType = {
  setTitle: (title: string) => void;
  title: string;
};

const defaultValue = {
  setTitle: () => {},
  title: "",
} as TitleProviderContextType;

const TitleContext = createContext(defaultValue);

const setDocumentTitle = (title: string) => {
  document.title = title ?? "...";
};

const PAGE_TITLES: { [key: string]: string } = {
  profiles: "Profiles",
  artifacts: "Artifacts",
  builds: "Builds",
  leaderboards: "Leaderboards",
};

const IGNORED_PAGES = [
  { minDepth: 1, mainSlug: "profile" },
  { minDepth: 1, mainSlug: "leaderboard" },
];

const checkIfPageIsIgnored = (pathname: string) => {
  let output = false;

  const _split = pathname.split("/");
  const mainSlug = _split[1];

  for (const page of IGNORED_PAGES) {
    if (mainSlug === page.mainSlug && _split.length >= page.minDepth) {
      output = true;
      break;
    }
  }

  return output;
};

const TitleContextProvider: React.FC<{ children: any }> = ({ children }) => {
  const [title, setTitle] = useState("");
  const location = useLocation();

  useEffect(() => {
    const _path = location.pathname.split("/")[1];
    const titlePrefix = PAGE_TITLES[_path];

    const isIgnoredPage = checkIfPageIsIgnored(location.pathname);
    if (isIgnoredPage) return;

    const finalTitle = titlePrefix
      ? `${titlePrefix} | Akasha System`
      : "Akasha System";

    setTitle(finalTitle);
  }, [location.pathname]);

  useEffect(() => {
    if (document.title === title) return;

    if (!IS_PRODUCATION) {
      setDocumentTitle(`DEV | ${title}`);
      return;
    }

    setDocumentTitle(title);
  }, [title]);

  const value = {
    setTitle,
    title,
  };

  return (
    <TitleContext.Provider value={value}>{children}</TitleContext.Provider>
  );
};

export { TitleContext, TitleContextProvider };
