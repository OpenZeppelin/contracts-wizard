//! This module build the Scaffold zip using Stellar upgrade command and return the result zipped.
use crate::controllers::download_scaffold;
use crate::models::ContractWithOptions;
use actix_web::{post, web, HttpResponse};

#[post("/download-scaffold")]
async fn download_scaffold_route(
    req: web::Json<ContractWithOptions>,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::Ok().body(download_scaffold(req).await))
}

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(download_scaffold_route);
}
