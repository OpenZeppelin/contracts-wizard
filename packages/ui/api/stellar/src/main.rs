use actix_web::{web, App, HttpServer};
use std::sync::Arc;
use stellar::config::ServerConfig;

// Import the routes module and configure_routes function
mod routes;
use crate::routes::configure_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting server");

    let config = Arc::new(ServerConfig::from_environment_variables());

    HttpServer::new(|| {
        App::new()
            .service(web::scope("/"))
            .configure(configure_routes)
    })
    .bind(("0.0.0.0", 5000))?
    .run()
    .await
}
