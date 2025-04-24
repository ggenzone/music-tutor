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
      <Route path="/music-tutor/jazz-comping" component={JazzCompingPage} />
      <Route path="/music-tutor/melody-player" component={MelodyPlayerPage} />
      <Route path="/music-tutor/guitar-tuner" component={GuitarTunerPage} />
      <Route path="/music-tutor/rhythm-patterns" component={RhythmPatternsPage} />
      <Route path="/music-tutor/partiture-editor" component={PartitureEditorPage} />
      <Route path="/music-tutor/metronome" component={MetronomePage} />
      <Route path="/music-tutor/routine-editor" component={RoutineEditorPage} />
      <Route path="/music-tutor/routine-player" component={RoutinePlayerPage} />  
      <Route path="/music-tutor/" component={Home} />
    </>
  );
}

export default App
