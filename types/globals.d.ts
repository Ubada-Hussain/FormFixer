export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      isPro?: boolean;
      subscriptionId?: string;
    };
  }
}
