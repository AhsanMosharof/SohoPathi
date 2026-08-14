/**
 * Shared Prisma Client instance for the application
 * Uses pg adapter for Prisma 7 compatibility
 */
require('dotenv').config();
const { PrismaClient } = require('./generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
