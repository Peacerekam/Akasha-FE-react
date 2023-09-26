import axios from "axios";
import React, { useEffect } from "react";
// import CookieConsent from "react-cookie-consent";
// import { QueryClient, QueryClientProvider } from "react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { LastProfilesContextProvider } from "./context/LastProfiles/LastProfilesContext";
import { HoverElementContextProvider } from "./context/HoverElement/HoverElementContext";
import { SessionDataContextProvider } from "./context/SessionData/SessionDataContext";
import { AdProviderContextProvider } from "./context/AdProvider/AdProviderContext";
import { NotificationsContextProvider } from "./context/Notifications/NotificationsContext";
import { TitleContextProvider } from "./context/TitleProvider/TitleProviderContext";

import {
  AdsComponentManager,
  Footer,
  Navbar,
  NavbarTabs,
  // MobileStickyBar,
  // NotificationBar,
  PageMessage,
} from "./components";

import {
  ArtifactsPage,
  ProfilePage,
  BuildsPage,
  LeaderboardsPage,
  CategorySelectionPage,
  // DashboardPage,
  AccountsPage,
  FAQPage,
} from "./pages";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicy";
import { TranslationContextProvider } from "./context/TranslationProvider/TranslationProviderContext";

// @TODO: env variables later on...
const urls = {
  "prod-mimee-ovh": "https://mimee.ovh",
  "prod-akasha-cv": "https://akasha.cv",
  localhost5033: "http://localhost:5033",
  localhost80: "http://localhost:80",
  // "game-rise-ovh": "http://54.39.29.82",
};

export const BASENAME = "/";
export const showAds = true;
export const isProduction = true; // set to true for akasha.cv domain
export const TRANSLATION_VERSION = 0.28; // increment this when translation keys are outdated
const MAINTENANCE_MODE = false;

const getApiBaseURL = () => {
  if (isProduction) {
    return urls["prod-akasha-cv"];
  }

  return urls["localhost80"];
};

axios.defaults.baseURL = getApiBaseURL();
axios.defaults.withCredentials = true;

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 30, // 30s
//     },
//   },
// });

const domainRedirect = () => {
  const currentHref = window.location.href;

  // let _from = "!@#$%!@#$";
  let _from = "mimee.ovh";

  switch (currentHref) {
    case "peacerekam.github.io":
      _from = "peacerekam.github.io";
      break;
    case "146.59.86.233":
      _from = "146.59.86.233";
      break;
    case "54.39.29.82":
      _from = "54.39.29.82";
      break;
  }

  if (currentHref.includes(_from) || currentHref.startsWith("www.")) {
    // startsWith ?? includes ??
    const _to = "akasha.cv";
    const newHref = currentHref
      .replace("www.", "")
      .replace(_from, _to) // change domain
      .replace("/#/", "/"); // HashRouter to BrowserRouter
    window.location.href = newHref;
  }
};

const App = () => {
  useEffect(() => {
    domainRedirect();
  }, []);

  if (MAINTENANCE_MODE) {
    return (
      <LastProfilesContextProvider>
        <BrowserRouter basename={BASENAME}>
          <div id="top-of-the-page">
            {/* <NotificationBar /> */}
            <Navbar />
          </div>
          <NavbarTabs />

          <div
            className={`content-wrapper ${isProduction ? "" : "dev-indicator"}`}
          >
            <HoverElementContextProvider>
              <Routes>
                <Route
                  path="*"
                  element={
                    <PageMessage message="Akasha is under maintenance right now.\nThis might take few hours." />
                  }
                />
              </Routes>
            </HoverElementContextProvider>
          </div>

          <Footer />
        </BrowserRouter>
      </LastProfilesContextProvider>
    );
  }

  return (
    // <QueryClientProvider client={queryClient}>
    <LastProfilesContextProvider>
      {/* <CookieConsent>
        This website uses cookies to enhance the user experience.
      </CookieConsent> */}
      <SessionDataContextProvider>
        <BrowserRouter basename={BASENAME}>
          <NotificationsContextProvider>
            <AdProviderContextProvider>
              <TitleContextProvider>
                <TranslationContextProvider>
                  {/* <MobileStickyBar /> */}
                  <div id="top-of-the-page">
                    {/* <NotificationBar /> */}
                    <Navbar />
                  </div>
                  <NavbarTabs />

                  <div className="flex-special-container mt-10">
                    <AdsComponentManager
                      adType="LeaderboardATF"
                      dataAdSlot="6204085735"
                      hybrid="desktop"
                    />
                  </div>

                  <div
                    className={`content-wrapper ${
                      isProduction ? "" : "dev-indicator"
                    }`}
                  >
                    <HoverElementContextProvider>
                      <Routes>
                        {/* @TODO: later use dashboard page instead */}
                        {/* <Route path="/" element={<DashboardPage />} /> */}
                        <Route path="/" element={<AccountsPage />} />
                        <Route path="/artifacts" element={<ArtifactsPage />} />
                        <Route path="/builds" element={<BuildsPage />} />
                        <Route path="/profiles" element={<AccountsPage />} />

                        <Route path="/profile/:uid" element={<ProfilePage />} />

                        {/* DEPRECATED */}
                        {/* <Route path="/profile/:uid/ads" element={<ProfilePage />} /> */}

                        <Route
                          path="/leaderboards"
                          element={<CategorySelectionPage />}
                        />

                        <Route
                          path="/leaderboards/:calculationId"
                          element={<LeaderboardsPage />}
                        />

                        <Route
                          path="/leaderboards/:calculationId/:variant"
                          element={<LeaderboardsPage />}
                        />

                        <Route path="/faq" element={<FAQPage />} />

                        <Route
                          path="/privacy-policy"
                          element={<PrivacyPolicyPage />}
                        />

                        <Route
                          path="*"
                          element={
                            <PageMessage message="404. Page not found." />
                          }
                        />
                      </Routes>
                    </HoverElementContextProvider>

                    <div className="flex-special-container">
                      <AdsComponentManager
                        adType="LeaderboardBTF"
                        dataAdSlot="6204085735"
                        hybrid="mobile"
                      />
                      <AdsComponentManager adType="RichMedia" />
                    </div>

                  </div>

                  <Footer />
                </TranslationContextProvider>
              </TitleContextProvider>
            </AdProviderContextProvider>
          </NotificationsContextProvider>
        </BrowserRouter>
      </SessionDataContextProvider>
    </LastProfilesContextProvider>
    // </QueryClientProvider>
  );
};

export default App;
