pub mod health;
pub mod upgrade_scaffold;

use actix_web::web;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.configure(health::init)
        .configure(upgrade_scaffold::init);
}
