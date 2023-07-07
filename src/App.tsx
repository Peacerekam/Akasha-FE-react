import axios from "axios";
import React, { useEffect } from "react";
// import CookieConsent from "react-cookie-consent";
// import { QueryClient, QueryClientProvider } from "react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { LastProfilesContextProvider } from "./context/LastProfiles/LastProfilesContext";
import { HoverElementContextProvider } from "./context/HoverElement/HoverElementContext";
import { SessionDataContextProvider } from "./context/SessionData/SessionDataContext";
import { AdProviderContextProvider } from "./context/AdProvider/AdProviderContext";
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
  // UIDSearchPage,
  AccountsPage,
} from "./pages";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicy";
import { NotificationsContextProvider } from "./context/Notifications/NotificationsContext";

// @TODO: env variables later on...
const urls = {
  prod: "https://mimee.ovh",
  "prod-akasha-cv": "https://akasha.cv",
  localhost: "http://localhost:5033",
  localhost80: "http://localhost:80",
  virmach: "http://149.57.165.73:5033",
  ovh: "http://146.59.86.233:5033",
  ovh80: "http://146.59.86.233",
  proxy: "http://localhost:3100/akasha",
  heroku: "https://akasha-backend.herokuapp.com",
};

export const showAds = true;
export const isProduction = false;
export const BASENAME = "/";
const MAINTENANCE_MODE = false;

axios.defaults.baseURL = urls[isProduction ? "prod-akasha-cv" : "localhost80"]; // prod
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

  let _from = "mimee.ovh";

  switch (currentHref) {
    case "peacerekam.github.io":
      _from = "peacerekam.github.io";
      break;
    case "146.59.86.233":
      _from = "146.59.86.233";
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
            <Footer />
          </div>
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
                    {/* <Route path="/profile" element={<UIDSearchPage />} /> */}
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

                    <Route
                      path="/privacy-policy"
                      element={<PrivacyPolicyPage />}
                    />

                    <Route
                      path="*"
                      element={<PageMessage message="404. Page not found." />}
                    />
                  </Routes>
                </HoverElementContextProvider>
                <Footer />
              </div>

              <div className="flex-special-container">
                <AdsComponentManager
                  adType="LeaderboardBTF"
                  dataAdSlot="6204085735"
                />
                <AdsComponentManager adType="RichMedia" />
              </div>
            </AdProviderContextProvider>
          </NotificationsContextProvider>
        </BrowserRouter>
      </SessionDataContextProvider>
    </LastProfilesContextProvider>
    // </QueryClientProvider>
  );
};

export default App;
