import { useMemo } from 'react';
import { appConfig } from '@/config/app.config';

export type ClientLogoConfig = {
  src?: string;
  alt: string;
};

export type AppConfig = {
  clientName: string;
  clientDescription: string;
  logo: ClientLogoConfig;
  supportEmail?: string;
  features: Record<string, boolean>;
  meta: Record<string, string | number | boolean>;
};

export function useConfig() {
  return useMemo(() => appConfig, []);
}
