//! This module upgrade a Rust contract environment to a Scaffold environment
use crate::controllers::upgrade_to_scaffold;
use actix_web::{http::header, post, web, HttpResponse};

#[post("/upgrade-scaffold")]
async fn download_scaffold_route(req: web::Bytes) -> Result<HttpResponse, actix_web::Error> {
    if !req.starts_with(b"PK\x03\x04") {
        return Ok(HttpResponse::BadRequest().body("not a zip"));
    }

    match upgrade_to_scaffold(req).await {
        Ok(body) => Ok(HttpResponse::Ok()
            .insert_header((header::CONTENT_TYPE, "application/zip"))
            .insert_header((
                header::CONTENT_DISPOSITION,
                "attachment; filename=archive.zip",
            ))
            .body(body)),
        Err(error) => {
            Ok(HttpResponse::InternalServerError().body(format!("Internal error: {error}")))
        }
    }
}

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(download_scaffold_route);
}
