use actix_web::{web, App, HttpServer};
use std::sync::Arc;
use stellar::config::ServerConfig;

use stellar::routes::configure_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting server");

    let config = Arc::new(ServerConfig::from_environment_variables());

    HttpServer::new(|| {
        App::new()
            .service(web::scope("/"))
            .configure(configure_routes)
    })
    .bind((config.host.clone(), config.port))?
    .run()
    .await
}
