//! This module provides a health check endpoint for the API.
//! The `/health` endpoint can be used to verify that the service is running and responsive.
use actix_web::{get, web, HttpResponse};

#[get("/health")]
async fn health() -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::Ok().body("OK"))
}

/// Initializes the health check service.
/// Registers the `health` endpoint with the provided service configuration.
pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
}
