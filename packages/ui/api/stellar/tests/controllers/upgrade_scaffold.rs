use actix_web::web;
use stellar_api::controllers::upgrade_to_scaffold;
use stellar_api::environment::{
    expected_entry_count, run_scaffold_upgrade_command, unzip_in_temporary_folder,
};
use zip::ZipArchive;

#[actix_rt::test]
async fn ai_upgrade_to_scaffold_invalid_zip_returns_err() {
    // invalid bytes should cause upgrade_to_scaffold to return an Err
    let bad = web::Bytes::from_static(&[0u8, 1, 2, 3]);
    let res = upgrade_to_scaffold(bad).await;
    assert!(res.is_err(), "expected error for invalid zip");
}

use serial_test::serial;
use std::env;
use std::fs::write;
use std::io::Cursor;
use std::io::Write as IoWrite;
use tempfile::tempdir;
use zip::write::FileOptions;
use zip::CompressionMethod;
use zip::ZipWriter;

fn make_fake_stellar(dir: &std::path::Path, exit_code: i32) -> std::path::PathBuf {
    let path = dir.join("stellar");
    let mut f = std::fs::File::create(&path).expect("create exe");
    write!(f, "#!/bin/sh\n").unwrap();
    write!(f, "exit {}\n", exit_code).unwrap();
    let mut perms = f.metadata().unwrap().permissions();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        perms.set_mode(0o755);
        std::fs::set_permissions(&path, perms).unwrap();
    }
    path
}

#[actix_rt::test]
#[serial]
async fn ai_upgrade_to_scaffold_success_returns_ok() {
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
            .add_directory("contracts/proj/src/", options)
            .unwrap();
        writer
            .start_file("contracts/proj/src/contract.rs", options)
            .unwrap();
        writer.write_all(b"c").unwrap();
        writer
            .start_file("contracts/proj/src/test.rs", options)
            .unwrap();
        writer.write_all(b"t").unwrap();
        writer
            .start_file("contracts/proj/src/lib.rs", options)
            .unwrap();
        writer.write_all(b"l").unwrap();
        writer
            .start_file("contracts/proj/Cargo.toml", options)
            .unwrap();
        writer.write_all(b"[package]").unwrap();
        writer.start_file("README.md", options).unwrap();
        writer.write_all(b"readme").unwrap();
        writer.start_file("Cargo.toml", options).unwrap();
        writer.write_all(b"[workspace]").unwrap();
        writer.finish().unwrap();
    }

    // debug: inspect zip archive entries vs expected count
    let contract_zipped_files = [
        "contracts/*/src/contract.rs",
        "contracts/*/src/test.rs",
        "contracts/*/src/lib.rs",
        "contracts/*/Cargo.toml",
        "Cargo.toml",
        "README.md",
    ];
    let cursor = Cursor::new(bytes.clone());
    if let Ok(archive) = ZipArchive::new(cursor) {
        eprintln!("archive.len() = {}", archive.len());
    } else {
        eprintln!("failed to open archive for debugging");
    }
    eprintln!(
        "expected_entry_count = {}",
        expected_entry_count(&contract_zipped_files)
    );

    let bin = tmp.path().join("bin");
    std::fs::create_dir_all(&bin).unwrap();
    let _exe = make_fake_stellar(&bin, 0);
    let old = env::var_os("PATH");
    let newp = format!("{}:{}", bin.display(), env::var("PATH").unwrap_or_default());
    env::set_var("PATH", &newp);

    eprintln!("TEST PATH={}", env::var("PATH").unwrap_or_default());
    eprintln!("stellar present: {}", bin.join("stellar").exists());

    let good = web::Bytes::from(bytes);

    // For debugging: unzip and run the scaffold command directly to see stderr
    match unzip_in_temporary_folder(good.to_vec(), &contract_zipped_files) {
        Ok(dir) => {
            eprintln!("extracted to: {}", dir.path().display());
            let rc = run_scaffold_upgrade_command(dir.path());
            eprintln!("run_scaffold_upgrade_command returned: {:?}", rc);
            let _ = dir.close();
        }
        Err(e) => {
            eprintln!("unzip error: {:?}", e);
        }
    }

    let res = upgrade_to_scaffold(good).await;

    if let Some(v) = old {
        env::set_var("PATH", v);
    }

    if let Err(e) = &res {
        eprintln!("upgrade_to_scaffold error: {:?}", e);
    }

    assert!(res.is_ok(), "expected Ok for valid upgrade flow");
    let zipped = res.unwrap();
    assert!(!zipped.is_empty(), "expected zipped bytes returned");
}

#[actix_rt::test]
#[serial]
async fn ai_upgrade_to_scaffold_internal_error_returns_err() {
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
            .add_directory("contracts/proj/src/", options)
            .unwrap();
        writer
            .start_file("contracts/proj/src/contract.rs", options)
            .unwrap();
        writer.write_all(b"c").unwrap();
        writer
            .start_file("contracts/proj/src/test.rs", options)
            .unwrap();
        writer.write_all(b"t").unwrap();
        writer
            .start_file("contracts/proj/src/lib.rs", options)
            .unwrap();
        writer.write_all(b"l").unwrap();
        writer
            .start_file("contracts/proj/Cargo.toml", options)
            .unwrap();
        writer.write_all(b"[package]").unwrap();
        writer.start_file("README.md", options).unwrap();
        writer.write_all(b"readme").unwrap();
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

    let good = web::Bytes::from(bytes);
    let res = upgrade_to_scaffold(good).await;

    if let Some(v) = old {
        env::set_var("PATH", v);
    }

    assert!(res.is_err(), "expected Err when scaffold command fails");
}
