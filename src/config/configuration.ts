export default (): AppConfig => {
  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV is not defined');
  }

  if (!['test', 'dev', 'production'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV value is not accepted');
  }

  const config = {
    http: {
      host: process.env.HTTP_HOST || '127.0.0.1',
      port: process.env.HTTP_PORT || 3001,
    },

    jwt: {
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: {
        expiresIn: process.env.JWT_SIGN_OPTIONS_EXPIRES_IN || '24h',
      },
    },

    db: {
      typeorm: {
        type: process.env.TYPEORM_TYPE || 'mysql',
        host: process.env.TYPEORM_HOST || 'localhost',
        database: process.env.TYPEORM_DATABASE || 'graphql',
        username: process.env.TYPEORM_USERNAME || 'root',
        password: process.env.TYPEORM_PASSWORD || 'password',
        charset: process.env.TYPEORM_CHARSET || 'utf8mb4',
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
    },

    discordBot: {
      host: process.env.DISCORD_BOT_HOST || '',
    },

    notion: {
      integrationToken: process.env.NOTION_INTEGRATION_TOKEN || '',
      databaseID: process.env.NOTION_DATABASE_ID || '',
    },
  };

  return config;
};

interface AppConfig {
  http: {
    host: string;
    port: string | number;
  };
  jwt: {
    secret: string;
    signOptions: {
      expiresIn: string;
    };
  };
  db: {
    typeorm: {
      type: string;
      host: string;
      database: string;
      username: string;
      password: string;
      charset: string;
    };
    redis: {
      host: string;
      port: string | number;
    };
  };
  discordBot: {
    host: string;
  };
  notion: {
    integrationToken: string;
    databaseID: string;
  };
}
