//! # API Module
//!
//! Contains HTTP API implementation for the stellar service.
//!
//! ## Structure
//!
//! * `config` - Configuration management for the API server
//! * `controllers` - Request handling and business logic
//! * `environment` - The logic for create, upgrading and zipping the contract environment
//! * `routes` - API endpoint definitions and routing
//! * `utils` - Some utility functions and error handling

pub mod config;
pub mod controllers;
pub mod environment;
pub mod routes;
pub mod utils;
