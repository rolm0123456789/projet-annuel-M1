import type { AppConfig } from '@/lib/hooks/useConfig';

export const appConfig: AppConfig = {
  clientName: 'Business First',
  clientDescription: 'Votre boutique en ligne de confiance pour tous vos besoins.',
  logo: {
    src: "Logo.svg",
    alt: 'Business First Logo',
  },
  supportEmail: undefined,
  features: {
    admin: true,
  },
  meta: {
    environment: import.meta.env.MODE,
  },
};
