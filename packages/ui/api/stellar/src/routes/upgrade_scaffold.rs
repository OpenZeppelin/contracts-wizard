//! This module upgrade a Rust contract environment to a Scaffold environment
use crate::controllers::upgrade_to_scaffold;
use actix_web::{http::header, post, web, HttpResponse};
use std::io::Cursor;
use zip::ZipArchive;

#[post("/upgrade-scaffold")]
async fn download_scaffold_route(req: web::Bytes) -> Result<HttpResponse, actix_web::Error> {
    if ZipArchive::new(Cursor::new(&req)).is_err() {
        return Ok(HttpResponse::UnsupportedMediaType().body("invalid ZIP archive"));
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
            log::error!("Error upgrading scaffold: {error}");
            Ok(HttpResponse::InternalServerError().body("Internal error"))
        }
    }
}

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(download_scaffold_route);
}
