import { renderBookstoreLivingOS, } from "./living-os-renderers/bookstore-renderer.js";
import { renderGeneralBusinessLivingOS, } from "./living-os-renderers/general-business-renderer.js";
import { renderTransportationLivingOS, } from "./living-os-renderers/transportation-renderer.js";
import { renderLegalLivingOS, } from "./living-os-renderers/legal-renderer.js";
import { renderHealthcareLivingOS, } from "./living-os-renderers/healthcare-renderer.js";
import { renderRestaurantLivingOS, } from "./living-os-renderers/restaurant-renderer.js";
import { renderCommerceLivingOS, } from "./living-os-renderers/commerce-renderer.js";
import { renderSaasLivingOS, } from "./living-os-renderers/saas-renderer.js";
import { renderFinanceLivingOS, } from "./living-os-renderers/finance-renderer.js";
import { renderProfessionalServicesLivingOS, } from "./living-os-renderers/professional-services-renderer.js";
import { renderAutomationLivingOS, } from "./living-os-renderers/automation-renderer.js";
const registry = new Map();
export function registerLivingOSRenderer(registration) {
    if (registry.has(registration.industry)) {
        throw new Error(`Living OS renderer already registered for ${registration.industry}`);
    }
    registry.set(registration.industry, registration);
}
export function replaceLivingOSRenderer(registration) {
    registry.set(registration.industry, registration);
}
export function getLivingOSRenderer(industry) {
    return registry.get(industry) || null;
}
export function hasLivingOSRenderer(industry) {
    return registry.has(industry);
}
export function listLivingOSRendererRegistrations() {
    return Array.from(registry.values()).map((registration) => ({
        industry: registration.industry,
        name: registration.name,
        version: registration.version,
    }));
}
registerLivingOSRenderer({
    industry: "bookstore",
    name: "bookstore-renderer",
    version: "2.0.0",
    renderer: renderBookstoreLivingOS,
});
// GENERAL_BUSINESS_LIVING_OS_REGISTRATIONS
for (const industry of [
    "general-business",
]) {
    registerLivingOSRenderer({
        industry,
        name: "general-business-renderer",
        version: "2.0.0",
        renderer: renderGeneralBusinessLivingOS,
    });
}
// TRANSPORTATION_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "transportation",
    name: "transportation-renderer",
    version: "2.0.0",
    renderer: renderTransportationLivingOS,
});
// LEGAL_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "legal",
    name: "legal-renderer",
    version: "2.0.0",
    renderer: renderLegalLivingOS,
});
// HEALTHCARE_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "healthcare",
    name: "healthcare-renderer",
    version: "2.0.0",
    renderer: renderHealthcareLivingOS,
});
// RESTAURANT_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "restaurant",
    name: "restaurant-renderer",
    version: "2.0.0",
    renderer: renderRestaurantLivingOS,
});
// COMMERCE_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "commerce",
    name: "commerce-renderer",
    version: "2.0.0",
    renderer: renderCommerceLivingOS,
});
// SAAS_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "saas",
    name: "saas-renderer",
    version: "2.0.0",
    renderer: renderSaasLivingOS,
});
// FINANCE_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "finance",
    name: "finance-renderer",
    version: "2.0.0",
    renderer: renderFinanceLivingOS,
});
// PROFESSIONAL_SERVICES_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "professional-services",
    name: "professional-services-renderer",
    version: "2.0.0",
    renderer: renderProfessionalServicesLivingOS,
});
// AUTOMATION_LIVING_OS_REGISTRATION
registerLivingOSRenderer({
    industry: "automation",
    name: "automation-renderer",
    version: "2.0.0",
    renderer: renderAutomationLivingOS,
});
