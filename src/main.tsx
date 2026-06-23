import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#b5121b",
          colorInfo: "#19539c",
          colorSuccess: "#2b7a4b",
          colorWarning: "#b87912",
          colorError: "#b5121b",
          borderRadius: 8,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        },
        components: {
          Layout: {
            headerBg: "#ffffff",
            siderBg: "#10213a",
            bodyBg: "#f3f5f8"
          },
          Menu: {
            darkItemSelectedBg: "#b5121b",
            darkItemHoverBg: "#233c62"
          },
          Card: {
            headerBg: "#ffffff"
          },
          Table: {
            headerBg: "#f2f5f9",
            headerColor: "#26364d"
          }
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);
