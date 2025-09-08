use crate::environment::{run_scaffold_upgrade_command, unzip_in_temporary_folder, zip_directory};
use crate::utils::to_http_hidden_error;
use actix_web::{web, Error as HttpError};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

fn list_files(dir: &Path) -> Vec<PathBuf> {
    WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .map(|e| e.into_path())
        .collect()
}

pub async fn upgrade_to_scaffold(rust_contract_zip: web::Bytes) -> Result<Vec<u8>, HttpError> {
    let contract_zipped_files = [
        "contracts/*/src/contract.rs",
        "contracts/*/src/test.rs",
        "contracts/*/src/lib.rs",
        "contracts/*/Cargo.toml",
        "Cargo.toml",
        "README.md",
    ];

    let contracts_dir =
        unzip_in_temporary_folder(rust_contract_zip.to_vec(), &contract_zipped_files)
            .map_err(to_http_hidden_error)?;

    run_scaffold_upgrade_command(contracts_dir.path()).map_err(to_http_hidden_error)?;

    let zipped_env = zip_directory(contracts_dir.path()).map_err(to_http_hidden_error)?;

    contracts_dir.close().map_err(to_http_hidden_error)?;
    Ok(zipped_env)
}
