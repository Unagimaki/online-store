import { GrowthBookProvider } from "@growthbook/growthbook-react"
import { AppRouter } from "./app/AppRouter"
import { growthbook, initGrowthbook } from "./lib/growthbook/config"
import { useEffect } from "react";

function App() {
    useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.init({ streaming: true });
    initGrowthbook()
  }, []);
  
  return (
    <div>
      <GrowthBookProvider growthbook={growthbook}>
        <AppRouter />
      </GrowthBookProvider>
    </div>
  )
}

export default App