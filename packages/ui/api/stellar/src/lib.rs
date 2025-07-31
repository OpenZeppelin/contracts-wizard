//! # API Module
//!
//! Contains HTTP API implementation for the stellar service.
//!
//! ## Structure
//!
//! * `controllers` - Request handling and business logic
//! * `routes` - API endpoint definitions and routing
//! * `models` - Data structures and types used in the API
//! * `config` - Configuration management for the API server

pub mod config;
pub mod controllers;
pub mod models;
pub mod routes;
