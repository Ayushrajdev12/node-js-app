module.exports = (app) => {
  const App = require("../controllers/app.controllers.js");

  app.post("/create", App.create);

  app.post("/login", App.login);

  app.post('/welcome', App.auth);

  app.get("/get-all", App.findAll);

  app.get("/message/:messageId", App.findOne);

  app.put("/update/:messageId", App.update);

  app.delete("/message/:messageId", App.delete);
};