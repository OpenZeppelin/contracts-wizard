use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize, Debug)]
pub struct ContractWithOptions {
    contract: Contract,
    opts: ContractOptions,
}

//TODO camel case
#[derive(Deserialize, Debug)]
pub struct Contract {
    license: String,
    securityContact: String,
    ownable: bool,
    documentations: Vec<String>,
    constructorArgs: Vec<String>,
    constructorCode: Vec<String>,
    implementedTraitsMap: HashMap<String, String>,
    freeFunctionsMap: HashMap<String, String>,
    variablesMap: HashMap<String, String>,
    useClausesMap: HashMap<String, String>,
    errorsMap: HashMap<String, String>,
    derivesSet: HashMap<String, String>,
    name: String,
}

#[derive(Deserialize, Debug)]
pub struct ContractOptions {
    kind: String,
    name: String,
    symbol: String,
    burnable: bool,
    pausable: bool,
    upgradeable: bool,
    premint: String,
    mintable: bool,
    access: bool,
    info: Info,
}

#[derive(Deserialize, Debug)]
struct Info {
    license: String,
}
