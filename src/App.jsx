import "./App.css";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import Forms from "./pages/Forms";
import Templates from "./layouts/Templates";
import Inscription from "./pages/authentification/Inscription";
import Connexion from "./pages/authentification/Connexion";
import Sondages from "./pages/Sondages";
import SondageResults from "./pages/SondageResults";
import ShareLink from "./pages/ShareLink";
import SondageVote from "./pages/SondageVote";
import PageAfterVote from "./pages/PageAfterVote";
import ListSondages from "./pages/ListSondages";
import AllInOne from "./pages/AllInOne";
import Soumissions from "./pages/Soumissions";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Templates />}>
        <Route index element={<Home />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/sondages" element={<Sondages />} />
        <Route path="/listsondages" element={<ListSondages />} />
        <Route path="/allinone/:sondageId" element={<AllInOne />} />
        <Route path="/sondages/:slug" element={<SondageVote />} />
        <Route path="/resultats/:sondageId" element={<SondageResults />} />
        <Route path="/share-link/:sondageId" element={<ShareLink />} />
        <Route path="/pageaftervote" element={<PageAfterVote />} />
        <Route path="/soumissions/:sondageId" element={<Soumissions />} />
      </Route>

      
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
