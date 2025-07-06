import System from 'systemjs';

System.register(['express'], function () {
  'use strict';
  var express_1, app;
  // var __moduleName = context_1 && context_1.id;
  return {
    setters: [
      function (express_1_1) {
        express_1 = express_1_1;
      },
    ],
    execute: function () {
      app = express_1.default();
      app.get('/', (req, res) => {
        res.send('Hello World!');
      });
      app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
      });
    },
  };
});
