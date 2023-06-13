const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(proxy("/api", { target: "http://localhost:3001" }));
  //app.use(proxy("/api", { target: "http://backend:3001" }));
  //app.use(proxy("/api", { target: "http://172.18.0.4:3001" }));
}