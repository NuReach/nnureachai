import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ClientDetail from "./pages/ClientDetail";
import ImmersionView from "./pages/ImmersionView";
import ContentPlan from "./pages/ContentPlan";
import ContentScript from "./pages/ContentScript";
import CreateBranding from "./pages/CreateBranding";
import TypologiesSelection from "./pages/TypologiesSelection";
import AllScripts from "./pages/AllScripts";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/client/:id" element={<ClientDetail />} />
        <Route path="/client/:id/immersion" element={<ImmersionView />} />
        <Route
          path="/client/:id/typologies"
          element={<TypologiesSelection />}
        />
        <Route path="/client/:id/scripts" element={<AllScripts />} />
        <Route path="/client/:id/content" element={<ContentPlan />} />
        <Route path="/client/:id/content/script" element={<ContentScript />} />
        <Route path="/client/:id/branding" element={<CreateBranding />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </Router>
  );
}

export default App;
