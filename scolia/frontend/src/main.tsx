import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./service/AuthContext"
import "./index.css"
import App from "./App"
import { AnneeProvider } from "./context/AnneeContext"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
 
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnneeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AnneeProvider>
      </BrowserRouter>
    </QueryClientProvider>

)

