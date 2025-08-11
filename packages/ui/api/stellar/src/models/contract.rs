use serde::Deserialize;
use std::collections::HashMap;

#[allow(dead_code)]
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ContractWithOptions {
    contract: Contract,
    opts: ContractOptions,
}

#[allow(dead_code)]
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Contract {
    license: String,
    security_contact: String,
    ownable: bool,
    documentations: Vec<String>,
    constructor_args: Vec<ConstructorArg>,
    constructor_code: Vec<String>,
    implemented_traits_map: HashMap<String, String>,
    free_functions_map: HashMap<String, String>,
    variables_map: HashMap<String, String>,
    use_clauses_map: HashMap<String, String>,
    errors_map: HashMap<String, String>,
    derives_set: HashMap<String, String>,
    name: String,
}

#[allow(dead_code)]
#[derive(Deserialize, Debug)]
pub struct ConstructorArg {
    name: String,
    #[serde(rename = "type")]
    arg_type: String,
}
#[allow(dead_code)]
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ContractOptions {
    kind: String,
    name: String,
    symbol: String,
    burnable: bool,
    pausable: bool,
    upgradeable: bool,
    premint: Option<String>,
    mintable: bool,
    access: Option<String>,
    info: Option<Info>,
}

#[allow(dead_code)]
#[derive(Deserialize, Debug)]
pub struct Info {
    license: String,
}
