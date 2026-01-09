const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

import { httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import { generalLimiter } from "#middlewares/rate-limit.middleware";
import userRoutes from "#routes/user.routes";
import adminRoutes from "#routes/admin.routes";
// Les routes seront importez ici
import authRouter from "#routes/auth.routes"

// import userRoutes from "#routes/user.routes";

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(generalLimiter);
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Express opérationnelle' });
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use(authRouter);

// Middleware NOT FOUND
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Middleware GLOBAL d'erreur
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    details: err.details || null,
  });
});

module.exports = app;
