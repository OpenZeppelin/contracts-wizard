use crate::environment::{run_scaffold_upgrade_command, unzip_in_temporary_folder};
use crate::utils::to_http_hidden_error;
use actix_web::{web, Error as HttpError};

pub async fn upgrade_to_scaffold(rust_contract_zip: web::Bytes) -> Result<String, HttpError> {
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

    //TODO clean up path contracts_environment_path

    contracts_dir.close()?;

    // Placeholder for the actual upgrade and zip logic
    Ok("Scaffold Upgrade and Zip Successful".to_string())
}
