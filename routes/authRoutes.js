const passport = require("passport");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const requireAuth = require("../middlewares/requireAuth");

module.exports = (app) => {
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.get("/auth/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/current_user", (req, res) => {
    res.status(200).json(req.user);
  });

  // Post payment info to Stripe and output the response back to the React App.
  app.post("/api/payments", requireAuth, async (req, res) => {
    const { amount, credits } = req.body;
    const { id } = req.body.token;
    const charge = await stripe.charges.create({
      amount: amount,
      currency: "usd",
      description: `Purchase for ${credits} credits on Emailer`,
      source: id,
    });
    console.log(charge);
    req.user.credits += credits;
    const user = await req.user.save();

    res.status(200).send(user);
  });
};
