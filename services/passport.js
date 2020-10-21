const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (gToken, refToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (!existingUser) {
        const user = await new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          nameFirst: profile.name.givenName,
          nameLast: profile.name.familyName,
        }).save();
        return done(null, user);
      }
      done(null, existingUser);
    }
  )
);
