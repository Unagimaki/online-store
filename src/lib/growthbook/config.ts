import { GrowthBook } from "@growthbook/growthbook";
import { autoAttributesPlugin } from "@growthbook/growthbook/plugins";

export const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-TUqapCMVAoSDDl5",
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    // This is where you would send an event to your analytics provider
    console.log("Viewed Experiment", {
      experimentId: experiment.key,
      variationId: result.key
    });
  },
  plugins: [ autoAttributesPlugin() ],
});

export const initGrowthbook = async () => {
  try {
    await growthbook.loadFeatures() // <- вот это подтягивает все флаги с GrowthBook.io
    console.log("✅ Флаги загружены", growthbook.getFeatures())
  } catch (error) {
    console.error("❌ Ошибка загрузки флагов:", error)
  }
}