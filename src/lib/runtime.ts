export const foundationMode = import.meta.env.VITE_BACKEND_MODE === "foundation";
export const demoMode = !foundationMode && import.meta.env.VITE_DEMO_MODE === "true";
