import { Route } from "wouter";
import Home from "./pages/home";
import JazzCompingPage from "./pages/jazz-comping/page";
import MelodyPlayerPage from "./pages/melody-player/page";
import GuitarTunerPage from "./pages/guitar-tuner/page";
import PartitureEditorPage from "./pages/partiture-editor/page";
import MetronomePage from "./pages/metronome/page";
import RoutineEditorPage from "./pages/routine-editor/page";
import RoutinePlayerPage from "./pages/routine-player/page";
import RhythmPatternsPage from "./pages/rhythm-patterns/page";

function App() {
  return (
    <>
      <Route path="/jazz-comping" component={JazzCompingPage} />
      <Route path="/melody-player" component={MelodyPlayerPage} />
      <Route path="/guitar-tuner" component={GuitarTunerPage} />
      <Route path="/rhythm-patterns" component={RhythmPatternsPage} />
      <Route path="/partiture-editor" component={PartitureEditorPage} />
      <Route path="/metronome" component={MetronomePage} />
      <Route path="/routine-editor" component={RoutineEditorPage} />
      <Route path="/routine-player" component={RoutinePlayerPage} />  
      <Route path="/" component={Home} />
    </>
  );
}

export default App
