pub mod download_scaffold;
pub mod health;

use actix_web::web;
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.configure(health::init)
        .configure(download_scaffold::init);
}
