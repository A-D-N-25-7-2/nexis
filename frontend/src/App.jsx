import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop'

function App() {

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b", // zinc-900
            color: "#fff",
            border: "1px solid #3f3f46", // zinc-700
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App
