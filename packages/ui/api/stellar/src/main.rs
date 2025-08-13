use actix_cors::Cors;
use actix_governor::{Governor, GovernorConfigBuilder};
use actix_web::{
    middleware::{self, Logger},
    web, App, HttpServer,
};
use dotenvy::dotenv;
use log::info;
use std::sync::Arc;
use stellar_api::config::ServerConfig;

use stellar_api::routes::configure_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let config = Arc::new(ServerConfig::from_environment_variables());

    let rate_limit_config = GovernorConfigBuilder::default()
        .requests_per_second(config.rate_limit_requests_per_second)
        .finish()
        .unwrap();

    let host = config.host.clone();
    let port = config.port;

    info!("Starting server on {host}:{port}");

    HttpServer::new(move || {
        let cors = {
            let wizard_origin = config.wizard_origin.clone();
            Cors::default()
                .allowed_origin_fn(move |origin, _req| {
                    if let Ok(origin_str) = origin.to_str() {
                        origin_str.ends_with("wizard.netlify.app")
                            || origin_str == "https://wizard.openzeppelin.com"
                            || origin_str == wizard_origin
                    } else {
                        false
                    }
                })
                .allowed_methods(["POST"])
                .allow_any_header()
        };

        App::new()
            .wrap(cors)
            .wrap(Governor::new(&rate_limit_config))
            .wrap(middleware::Compress::default())
            .wrap(Logger::default())
            .service(web::scope("/stellar").configure(configure_routes))
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}
