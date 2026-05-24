import Swup from "swup";

const swup = new Swup({
  containers: ["#swup"],
  plugins: [],
});

swup.hooks.on("page:view", () => {
  window.scrollTo({ top: 0, behavior: "instant" });
});
