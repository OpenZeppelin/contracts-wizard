use actix_cors::Cors;
use actix_governor::{Governor, GovernorConfigBuilder};
use actix_web::{
    middleware::{self, Logger},
    web, App, HttpServer,
};
use std::sync::Arc;
use stellar::config::ServerConfig;

use stellar::routes::configure_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = Arc::new(ServerConfig::from_environment_variables());

    let wizard_origin = config.wizard_origin.clone();

    let rate_limit_config = GovernorConfigBuilder::default()
        .requests_per_second(config.rate_limit_requests_per_second)
        .finish()
        .unwrap();

    println!("Starting server on {}:{}", config.host, config.port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin(wizard_origin.as_str())
            .allowed_methods(["POST"])
            .allow_any_header();

        App::new()
            .wrap(cors)
            .wrap(Governor::new(&rate_limit_config))
            .wrap(middleware::Compress::default())
            .wrap(Logger::default())
            .service(web::scope("/stellar"))
            .configure(configure_routes)
    })
    .bind((config.host.as_str(), config.port))?
    .run()
    .await
}
