use actix_web::{test, App};
use std::env;
use std::fs::write;
use std::path::Path;
use tempfile::tempdir;

use std::io::{Cursor, Write};
use std::os::unix::fs::PermissionsExt;
use zip::write::FileOptions;
use zip::CompressionMethod;
use zip::ZipWriter;

use stellar_api::routes::upgrade_scaffold::init as upgrade_init;

fn make_fake_stellar(dir: &Path, exit_code: i32) -> std::path::PathBuf {
    let path = dir.join("stellar");
    let mut f = std::fs::File::create(&path).expect("create exe");
    write!(f, "#!/bin/sh\n").unwrap();
    write!(f, "exit {}\n", exit_code).unwrap();
    let mut perms = f.metadata().unwrap().permissions();
    perms.set_mode(0o755);
    std::fs::set_permissions(&path, perms).unwrap();
    path
}

#[actix_rt::test]
async fn ai_upgrade_route_invalid_zip_returns_415() {
    let app = test::init_service(App::new().configure(|cfg| upgrade_init(cfg))).await;
    let req = test::TestRequest::post()
        .uri("/upgrade-scaffold")
        .set_payload(vec![0u8, 1, 2])
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status().as_u16(), 415);
}

#[actix_rt::test]
async fn ai_upgrade_route_internal_error_returns_500() {
    // prepare a valid zip but make stellar fail to force internal error
    let tmp = tempdir().expect("tmp");
    let root = tmp.path();
    std::fs::create_dir_all(root.join("contracts/proj/src")).unwrap();
    write(root.join("contracts/proj/src/contract.rs"), b"c").unwrap();
    write(root.join("contracts/proj/Cargo.toml"), b"[package]").unwrap();
    write(root.join("Cargo.toml"), b"[workspace]").unwrap();

    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Deflated);
        writer.add_directory("contracts/", options).unwrap();
        writer.add_directory("contracts/proj/", options).unwrap();
        writer
            .start_file("contracts/proj/src/contract.rs", options)
            .unwrap();
        writer.write_all(b"c").unwrap();
        writer
            .start_file("contracts/proj/Cargo.toml", options)
            .unwrap();
        writer.write_all(b"[package]").unwrap();
        writer.start_file("Cargo.toml", options).unwrap();
        writer.write_all(b"[workspace]").unwrap();
        writer.finish().unwrap();
    }

    let bin = tmp.path().join("bin");
    std::fs::create_dir_all(&bin).unwrap();
    let _exe = make_fake_stellar(&bin, 2);
    let old = env::var_os("PATH");
    let newp = format!("{}:{}", bin.display(), env::var("PATH").unwrap_or_default());
    env::set_var("PATH", &newp);

    let app = test::init_service(App::new().configure(|cfg| upgrade_init(cfg))).await;
    let req = test::TestRequest::post()
        .uri("/upgrade-scaffold")
        .set_payload(bytes)
        .to_request();
    let resp = test::call_service(&app, req).await;

    if let Some(v) = old {
        env::set_var("PATH", v);
    }

    assert_eq!(resp.status().as_u16(), 500);
}

#[actix_rt::test]
async fn ai_upgrade_route_success_returns_zip() {
    let tmp = tempdir().expect("tmp");
    let root = tmp.path();
    std::fs::create_dir_all(root.join("contracts/proj/src")).unwrap();
    write(root.join("contracts/proj/src/contract.rs"), b"c").unwrap();
    write(root.join("contracts/proj/Cargo.toml"), b"[package]").unwrap();
    write(root.join("Cargo.toml"), b"[workspace]").unwrap();

    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Deflated);
        writer.add_directory("contracts/", options).unwrap();
        writer.add_directory("contracts/proj/", options).unwrap();
        writer
            .start_file("contracts/proj/src/contract.rs", options)
            .unwrap();
        writer.write_all(b"c").unwrap();
        writer
            .start_file("contracts/proj/Cargo.toml", options)
            .unwrap();
        writer.write_all(b"[package]").unwrap();
        writer.start_file("Cargo.toml", options).unwrap();
        writer.write_all(b"[workspace]").unwrap();
        writer.finish().unwrap();
    }

    let bin = tmp.path().join("bin");
    std::fs::create_dir_all(&bin).unwrap();
    let _exe = make_fake_stellar(&bin, 0);
    let old = env::var_os("PATH");
    let newp = format!("{}:{}", bin.display(), env::var("PATH").unwrap_or_default());
    env::set_var("PATH", &newp);

    let app = test::init_service(App::new().configure(|cfg| upgrade_init(cfg))).await;
    let req = test::TestRequest::post()
        .uri("/upgrade-scaffold")
        .set_payload(bytes)
        .to_request();
    let resp = test::call_service(&app, req).await;

    if let Some(v) = old {
        env::set_var("PATH", v);
    }

    assert_eq!(resp.status().as_u16(), 200);
    let headers = resp.headers();
    assert!(headers.get("content-type").is_some());
}
