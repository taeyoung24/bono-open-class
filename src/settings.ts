function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue) {
      console.log(`The environment variable '${key}' is not defined. Using default value '${defaultValue}'.`);
      return defaultValue;
    }
    throw new Error(`The environment variable '${key}' is not defined.`);
  }
  return value;
}

export const NODE_ENV = requireEnv('NODE_ENV', 'development');
export const DISCORD_WEBHOOK_URL = requireEnv('DISCORD_WEBHOOK_URL');

const isProd = NODE_ENV === 'production';

if (NODE_ENV !== 'production') {
  console.log(`[Config] Loaded environment variables from: .env.${NODE_ENV}`);
}

export const GLOBAL_CONFIG = {
  isProd: isProd,
  discordManagerUserId: "334298300364619776",
};

