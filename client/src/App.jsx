import AppRoutes from "./routes/AppRoutes";
import AppErrorBoundary from "./components/AppErrorBoundary";

function App() {
  return (
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  );
}

export default App;
