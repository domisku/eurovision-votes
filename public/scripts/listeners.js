const countrySelector = document.querySelector("#country");
const form = document.querySelector("form");
countrySelector.addEventListener("change", () => {
  form.submit();
});
