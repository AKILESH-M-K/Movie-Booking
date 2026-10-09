import { resolveApiConfig } from "../api/apiConfig";

const pageOrigin = "https://cinebook.example";

test("uses bundled local data in production when no backend URL is configured", () => {
  expect(resolveApiConfig({ isDev: false, isProd: true, configuredUrl: "", pageOrigin })).toEqual({
    url: "",
    enabled: false,
    invalid: false,
  });
});

test("disables an insecure production API without throwing or making HTTP requests", () => {
  expect(resolveApiConfig({
    isDev: false,
    isProd: true,
    configuredUrl: "http://localhost:4000",
    pageOrigin,
  })).toEqual({ url: "", enabled: false, invalid: true });
});

test("enables a configured HTTPS production API", () => {
  expect(resolveApiConfig({
    isDev: false,
    isProd: true,
    configuredUrl: "https://api.cinebook.example/v1",
    pageOrigin,
  })).toEqual({
    url: "https://api.cinebook.example/v1",
    enabled: true,
    invalid: false,
  });
});

test("allows secure same-origin relative API paths in production", () => {
  expect(resolveApiConfig({
    isDev: false,
    isProd: true,
    configuredUrl: "/api",
    pageOrigin,
  })).toEqual({ url: "/api", enabled: true, invalid: false });
});

test("keeps the local HTTP backend available in development by default", () => {
  expect(resolveApiConfig({ isDev: true, isProd: false, configuredUrl: "", pageOrigin })).toEqual({
    url: "http://localhost:4000",
    enabled: true,
    invalid: false,
  });
});
