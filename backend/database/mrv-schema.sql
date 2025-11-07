-- BlueCarbon Ledger - MRV Automated Workflow Database Schema
-- PostgreSQL + PostGIS for geospatial data

-- Enable PostGIS extension for geospatial operations
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Project Registry Database
CREATE TABLE project_registry