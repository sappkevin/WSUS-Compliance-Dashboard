import passport from "passport";
import { Strategy as LdapStrategy } from "passport-ldapauth";
import session from "express-session";
import SQLiteStore from "express-session-sqlite";
import type { Express } from "express";

export function configureAuth(app: Express) {
  // Configure session middleware
  const Store = SQLiteStore(session);

  app.use(session({
    store: new Store({
      path: './.data/sessions.db',
      ttl: 24 * 60 * 60 // 1 day
    }),
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  }));

  // Configure Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LdapStrategy({
    server: {
      url: process.env.LDAP_URL || '',
      bindDN: process.env.WSUS_SERVICE_ACCOUNT || '',
      bindCredentials: process.env.WSUS_SERVICE_PASSWORD || '',
      searchBase: process.env.LDAP_BASE_DN || '',
      searchFilter: `(${process.env.LDAP_USERNAME_ATTRIBUTE || 'sAMAccountName'}={{username}})`,
      groupSearchBase: process.env.LDAP_GROUP_BASE_DN,
      groupSearchFilter: `(member={{dn}})`,
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  return { requireAuth };
}