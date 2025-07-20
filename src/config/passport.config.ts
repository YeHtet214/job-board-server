import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from './env.config.js';

import prisma from '../prisma/client.js';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (user) {
      const authenticatedUser = { userId: user.id, ...user };
      done(null, authenticatedUser);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_REDIRECT_URI,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: profile.emails![0].value }
        });

        if (!user) {
          // Create new user if doesn't exist
          user = await prisma.user.create({
            data: {
              email: profile.emails![0].value,
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              role: 'JOBSEEKER',
              googleId: profile.id,
              isEmailVerified: true
            }
          });
        }

        return done(null, { userId: user.id, ...user });
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
