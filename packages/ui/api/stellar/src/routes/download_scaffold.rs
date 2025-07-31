//! This module build the Scaffold zip using Stellar upgrade command and return the result zipped.
use crate::controllers::download_scaffold;
use crate::models::Contract;
use actix_web::{get, web, HttpResponse};

#[get("/download-scaffold")]
async fn download_scaffold_route(
    req: web::Json<Contract>,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::Ok().body(download_scaffold(req).await))
}

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(download_scaffold_route);
}
