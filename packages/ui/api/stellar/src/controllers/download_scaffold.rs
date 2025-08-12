use crate::environment::zip_directory;
use crate::models::ContractWithOptions;
use actix_web::web;

// pub async fn download_scaffold(_contract: web::Json<ContractWithOptions>) -> Vec<u8> {
//     let zip_bytes = zip_directory(root)?;
//     // TempDir cleans up automatically here; zip is already in memory.
//     Ok(zip_bytes)
// }

pub async fn download_scaffold(_contract: web::Json<ContractWithOptions>) -> String {
    // Placeholder for the actual upgrade and zip logic
    "Scaffold Upgrade and Zip Successful".to_string()
}

// mod tests {
//     use super::*;

//     #[test]
//     fn build_zip_folder_then_zip() {
//         let c = Contract {
//             name: "MyToken".into(),
//         };
//         let opts = GenericOptions {
//             kind: Some("Fungible".into()),
//         };

//         let bytes = build_rust_project_zip(&c, &opts).expect("zip build");
//         std::fs::write("rust_contract_env.zip", &bytes).unwrap();

//         assert!(bytes.len() > 0);
//     }
// }
