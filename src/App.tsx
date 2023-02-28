import axios from "axios";
import React, { useEffect } from "react";
import CookieConsent from "react-cookie-consent";
// import { QueryClient, QueryClientProvider } from "react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { LastProfilesContextProvider } from "./context/LastProfiles/LastProfilesContext";
import { HoverElementContextProvider } from "./context/HoverElement/HoverElementContext";
import { SessionDataContextProvider } from "./context/SessionData/SessionDataContext";
import {
  Footer,
  Navbar,
  NavbarTabs,
  NotificationBar,
  PageMessage,
} from "./components";

import {
  ArtifactsPage,
  ProfilePage,
  BuildsPage,
  LeaderboardsPage,
  CategorySelectionPage,
  // DashboardPage,
  UIDSearchPage,
} from "./pages";

// @TODO: env variables later on...
const urls = {
  prod: "https://www.mimee.ovh",
  localhost: "http://localhost:5033",
  localhost80: "http://localhost:80",
  virmach: "http://149.57.165.73:5033",
  ovh: "http://146.59.86.233:5033",
  proxy: "http://localhost:3100/akasha",
  heroku: "https://akasha-backend.herokuapp.com",
};

export const showAds = true;
export const isProduction = false;
export const BASENAME = "/akasha";
const MAINTENANCE_MODE = false;

axios.defaults.baseURL = urls[isProduction ? "prod" : "localhost80"];
axios.defaults.withCredentials = true;

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 30, // 30s
//     },
//   },
// });

const domainRedirect = () => {
  const _from = "peacerekam.github.io";
  const _to = "mimee.ovh";
  const currentHref = window.location.href;
  if (currentHref.includes(_from)) {
    const newHref = currentHref
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
          {/* <NotificationBar /> */}
          <Navbar />
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
      <CookieConsent>
        This website uses cookies to enhance the user experience.
      </CookieConsent>
      <SessionDataContextProvider>
        <BrowserRouter basename={BASENAME}>
          <NotificationBar />
          <Navbar />
          <NavbarTabs />
          <div
            className={`content-wrapper ${isProduction ? "" : "dev-indicator"}`}
          >
            <HoverElementContextProvider>
              <Routes>
                {/* @TODO: later use dashboard page instead */}
                {/* <Route path="/" element={<DashboardPage />} /> */}
                <Route path="/" element={<UIDSearchPage />} />
                <Route path="/artifacts" element={<ArtifactsPage />} />
                <Route path="/builds" element={<BuildsPage />} />
                <Route path="/profile" element={<UIDSearchPage />} />
                <Route path="/profile/:uid" element={<ProfilePage />} />

                {/* <Route path="/builds/ads" element={<BuildsPage />} />
                  <Route path="/profile/:uid/ads" element={<ProfilePage />} /> */}

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
                  path="*"
                  element={<PageMessage message="404. Page not found." />}
                />
              </Routes>
            </HoverElementContextProvider>
            <Footer />
          </div>
        </BrowserRouter>
      </SessionDataContextProvider>
    </LastProfilesContextProvider>
    // </QueryClientProvider>
  );
};

export default App;
