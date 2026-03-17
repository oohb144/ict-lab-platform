import 'dotenv/config';

export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: '7d',
  giteeOwner: process.env.GITEE_OWNER || '',
  giteeRepo: process.env.GITEE_REPO || '',
  giteeToken: process.env.GITEE_TOKEN || '',
};
