//! # API Module
//!
//! Contains HTTP API implementation for the stellar service.
//!
//! ## Structure
//!
//! * `config` - Configuration management for the API server
//! * `controllers` - Request handling and business logic
//! * `environment` - The logic for create, upgrading and zipping the contract environment
//! * `models` - Data structures and types used in the API
//! * `routes` - API endpoint definitions and routing

pub mod config;
pub mod controllers;
pub mod environment;
pub mod models;
pub mod routes;
