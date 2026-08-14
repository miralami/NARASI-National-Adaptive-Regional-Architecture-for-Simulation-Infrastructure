/**
 * NARASI - Application shell.
 * Policy Lab / Comparison / Progressive Twin views.
 */

import { useSimulationStore } from './store/useSimulationStore';
import { Header } from './components/layout/Header';
import { ViewTabs } from './components/layout/ViewTabs';
import { LabView } from './components/lab/LabView';
import { ComparisonWorkbench } from './components/comparison/ComparisonWorkbench';
import { ProgressiveTwinDiagram } from './components/maturity/ProgressiveTwinDiagram';

export default function App() {
  const viewMode = useSimulationStore((s) => s.viewMode);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-abyss text-slate-200">
      <Header />
      <ViewTabs />
      <div className="min-h-0 flex-1">
        {viewMode === 'lab' ? <LabView /> : null}
        {viewMode === 'compare' ? <ComparisonWorkbench /> : null}
        {viewMode === 'maturity' ? <ProgressiveTwinDiagram /> : null}
      </div>
    </div>
  );
}
