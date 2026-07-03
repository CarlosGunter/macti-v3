import type { InstitutesType } from "./institutes";

interface KeycloakConfig {
  clientId: string;
  clientSecret: string;
  issuer: string;
}

export const keycloakConfigs: Record<InstitutesType, KeycloakConfig> = {
  principal: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.PRINCIPAL_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_PRINCIPAL_KEYCLOAK_ISSUER || "",
  },
  cuantico: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.CUANTICO_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_CUANTICO_KEYCLOAK_ISSUER || "",
  },
  ciencias: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.CIENCIAS_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_CIENCIAS_KEYCLOAK_ISSUER || "",
  },
  ingenieria: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.INGENIERIA_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_INGENIERIA_KEYCLOAK_ISSUER || "",
  },
  encit: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.ENCIT_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_ENCIT_KEYCLOAK_ISSUER || "",
  },
  ier: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.IER_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_IER_KEYCLOAK_ISSUER || "",
  },
  enes_m: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.ENES_M_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_ENES_M_KEYCLOAK_ISSUER || "",
  },
  hpc: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.HPC_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_HPC_KEYCLOAK_ISSUER || "",
  },
  igf: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.IGF_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_IGF_KEYCLOAK_ISSUER || "",
  },
  enes_jur: {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.ENES_JUR_KEYCLOAK_CLIENT_SECRET || "",
    issuer: process.env.NEXT_PUBLIC_ENES_JUR_KEYCLOAK_ISSUER || "",
  },
};
