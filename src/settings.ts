function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    // 클라이언트 브라우저 환경에서는 환경 변수에 접근할 수 없으므로 에러를 던지지 않고 기본값이나 빈 문자열을 반환합니다.
    if (typeof window !== 'undefined') {
      return defaultValue || '';
    }
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

if (typeof window === 'undefined' && NODE_ENV !== 'production') {
  console.log(`[Config] Loaded environment variables from: .env.${NODE_ENV}`);
}

export const GLOBAL_CONFIG = {
  isProd: isProd,
  discordManagerUserId: "334298300364619776",
  passwordResetExpiryMinutes: 5,
  authRegex: {
    userId: /^[a-zA-Z0-9]{4,}$/, // 4자 이상의 영문 또는 숫자
    password: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, // 영문, 숫자, 특수문자 포함 8자 이상
  },
  emailDomain: 'bono.com',
};

