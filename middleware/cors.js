//
// const cors = require('cors');
//
// const corsOptions = {
//   origin: [
//     'https://gabonconcours.vercel.app',
//     'https://gabonconcours.netlify.app',
//     'http://localhost:5173',
//     'http://localhost:3002',
//     'http://localhost:8081',
//     'http://127.0.0.1:8081',
//     'http://localhost:8080',
//     'http://127.0.0.1:8080',
//     'http://localhost:8082',
//     'http://127.0.0.1:8082',
//
//     'http://localhost:8084',
//     'http://127.0.0.1:8084',
//     'http://localhost:8083',
//     'http://127.0.0.1:8083',
//     'http://localhost:8085',
//     'http://127.0.0.1:8085',  'http://localhost:8088',
//     'http://127.0.0.1:8086',  'http://localhost:8089',
//     'http://127.0.0.1:8086',  'http://localhost:8089',
//     'http://127.0.0.1:8087',  'http://localhost:8090',
//     'http://127.0.0.1:8087',
//     'http://127.0.0.1:8088',
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
// };
//
// module.exports = cors(corsOptions);


const cors = require("cors");

const corsOptions = {
  origin: "*", // <-- tout le monde est autorisé
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

module.exports = cors(corsOptions);

