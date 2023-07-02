import express from "express";
import hbs from "hbs";
import path from "path";
import {
  getBottomCountryVoters,
  getChanceToQualifyToFinals,
  getCountries,
  getPercentageOfPointsPerEdition,
  getTopCountryVoters,
} from "./queries/votes";

const app = express();
const PORT = 10000;

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
hbs.registerHelper("json", function (obj) {
  return JSON.stringify(obj);
});
hbs.registerPartials(path.join(__dirname, "views/partials"));

app.get("/", async (req, res) => {
  try {
    const countries = (await getCountries()).map((c) => c.country);
    const country = (req.query.country as string) ?? countries[0];

    const chartData = await getPercentageOfPointsPerEdition(country);
    const top5Voters = await getTopCountryVoters(country);
    const bottom5Voters = await getBottomCountryVoters(country);
    const qualifyChance = (await getChanceToQualifyToFinals(country))[0]
      .qualify_chance;

    res.render("index", {
      chartData,
      countries,
      country,
      top5Voters,
      bottom5Voters,
      qualifyChance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("<h1>Something went wrong!</h1>");
  }
});

app.listen(PORT, () => {
  console.log("Server listening on port: ", PORT);
});
