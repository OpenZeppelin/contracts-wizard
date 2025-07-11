# Snapshot report for `src/fungible.test.ts`

The actual snapshot is saved in `fungible.test.ts.snap`.

Generated by [AVA](https://avajs.dev).

## basic fungible

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, FungibleToken};␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
    }␊
    `

## fungible burnable

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, burnable::FungibleBurnable, FungibleToken};␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
    }␊
    ␊
    //␊
    // Extensions␊
    //␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleBurnable for MyToken {}␊
    `

## fungible pausable

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, FungibleToken};␊
    use stellar_ownable::{self as ownable, Ownable};␊
    use stellar_ownable_macro::only_owner;␊
    use stellar_pausable::{self as pausable, Pausable};␊
    use stellar_pausable_macros::when_not_paused;␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env, owner: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
            ownable::set_owner(e, &owner);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
        #[when_not_paused]␊
        fn transfer(e: &Env, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer(e, &from, &to, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer_from(e, &spender, &from, &to, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Utils␊
    //␊
    ␊
    #[contractimpl]␊
    impl Pausable for MyToken {␊
        fn paused(e: &Env) -> bool {␊
            pausable::paused(e)␊
        }␊
    ␊
        #[only_owner]␊
        fn pause(e: &Env, caller: Address) {␊
            pausable::pause(e);␊
        }␊
    ␊
        #[only_owner]␊
        fn unpause(e: &Env, caller: Address) {␊
            pausable::unpause(e);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl Ownable for MyToken {}␊
    `

## fungible burnable pausable

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, burnable::FungibleBurnable, FungibleToken};␊
    use stellar_ownable::{self as ownable, Ownable};␊
    use stellar_ownable_macro::only_owner;␊
    use stellar_pausable::{self as pausable, Pausable};␊
    use stellar_pausable_macros::when_not_paused;␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env, owner: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
            ownable::set_owner(e, &owner);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
        #[when_not_paused]␊
        fn transfer(e: &Env, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer(e, &from, &to, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer_from(e, &spender, &from, &to, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Extensions␊
    //␊
    ␊
    #[contractimpl]␊
    impl FungibleBurnable for MyToken {␊
        #[when_not_paused]␊
        fn burn(e: &Env, from: Address, amount: i128) {␊
            Base::burn(e, &from, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn burn_from(e: &Env, spender: Address, from: Address, amount: i128) {␊
            Base::burn_from(e, &spender, &from, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Utils␊
    //␊
    ␊
    #[contractimpl]␊
    impl Pausable for MyToken {␊
        fn paused(e: &Env) -> bool {␊
            pausable::paused(e)␊
        }␊
    ␊
        #[only_owner]␊
        fn pause(e: &Env, caller: Address) {␊
            pausable::pause(e);␊
        }␊
    ␊
        #[only_owner]␊
        fn unpause(e: &Env, caller: Address) {␊
            pausable::unpause(e);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl Ownable for MyToken {}␊
    `

## fungible preminted

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, FungibleToken};␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env, recipient: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
            Base::mint(e, &recipient, 1000000000000000000000);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
    }␊
    `

## fungible premint of 0

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, FungibleToken};␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
    }␊
    `

## fungible mintable

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, FungibleToken};␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
    }␊
    `

## fungible ownable

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, FungibleToken};␊
    use stellar_ownable::{self as ownable, Ownable};␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env, owner: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
            ownable::set_owner(e, &owner);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
    }␊
    ␊
    //␊
    // Utils␊
    //␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl Ownable for MyToken {}␊
    `

## fungible roles

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_access_control::{self as access_control, AccessControl};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, FungibleToken};␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env, admin: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
            access_control::set_admin(e, &admin);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
    }␊
    ␊
    //␊
    // Utils␊
    //␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl AccessControl for MyToken {}␊
    `

## fungible full - ownable

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, burnable::FungibleBurnable, FungibleToken};␊
    use stellar_ownable::{self as ownable, Ownable};␊
    use stellar_ownable_macro::only_owner;␊
    use stellar_pausable::{self as pausable, Pausable};␊
    use stellar_pausable_macros::when_not_paused;␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env, recipient: Address, owner: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
            Base::mint(e, &recipient, 2000000000000000000000);␊
            ownable::set_owner(e, &owner);␊
        }␊
    ␊
        #[only_owner]␊
        #[when_not_paused]␊
        pub fn mint(e: &Env, account: Address, amount: i128) {␊
            Base::mint(e, &account, amount);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
        #[when_not_paused]␊
        fn transfer(e: &Env, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer(e, &from, &to, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer_from(e, &spender, &from, &to, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Extensions␊
    //␊
    ␊
    #[contractimpl]␊
    impl FungibleBurnable for MyToken {␊
        #[when_not_paused]␊
        fn burn(e: &Env, from: Address, amount: i128) {␊
            Base::burn(e, &from, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn burn_from(e: &Env, spender: Address, from: Address, amount: i128) {␊
            Base::burn_from(e, &spender, &from, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Utils␊
    //␊
    ␊
    #[contractimpl]␊
    impl Pausable for MyToken {␊
        fn paused(e: &Env) -> bool {␊
            pausable::paused(e)␊
        }␊
    ␊
        #[only_owner]␊
        fn pause(e: &Env, caller: Address) {␊
            pausable::pause(e);␊
        }␊
    ␊
        #[only_owner]␊
        fn unpause(e: &Env, caller: Address) {␊
            pausable::unpause(e);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl Ownable for MyToken {}␊
    `

## fungible full - roles

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String, Symbol};␊
    use stellar_access_control::{self as access_control, AccessControl};␊
    use stellar_access_control_macros::only_role;␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, burnable::FungibleBurnable, FungibleToken};␊
    use stellar_pausable::{self as pausable, Pausable};␊
    use stellar_pausable_macros::when_not_paused;␊
    ␊
    #[contract]␊
    pub struct MyToken;␊
    ␊
    #[contractimpl]␊
    impl MyToken {␊
        pub fn __constructor(e: &Env, recipient: Address, admin: Address, pauser: Address, minter: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));␊
            Base::mint(e, &recipient, 2000000000000000000000);␊
            access_control::set_admin(e, &admin);␊
            access_control::grant_role_no_auth(e, &admin, &pauser, &Symbol::new(e, "pauser"));␊
            access_control::grant_role_no_auth(e, &admin, &minter, &Symbol::new(e, "minter"));␊
        }␊
    ␊
        #[only_role(caller, "minter")]␊
        #[when_not_paused]␊
        pub fn mint(e: &Env, account: Address, amount: i128, caller: Address) {␊
            Base::mint(e, &account, amount);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for MyToken {␊
        type ContractType = Base;␊
    ␊
        #[when_not_paused]␊
        fn transfer(e: &Env, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer(e, &from, &to, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer_from(e, &spender, &from, &to, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Extensions␊
    //␊
    ␊
    #[contractimpl]␊
    impl FungibleBurnable for MyToken {␊
        #[when_not_paused]␊
        fn burn(e: &Env, from: Address, amount: i128) {␊
            Base::burn(e, &from, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn burn_from(e: &Env, spender: Address, from: Address, amount: i128) {␊
            Base::burn_from(e, &spender, &from, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Utils␊
    //␊
    ␊
    #[contractimpl]␊
    impl Pausable for MyToken {␊
        fn paused(e: &Env) -> bool {␊
            pausable::paused(e)␊
        }␊
    ␊
        #[only_role(caller, "pauser")]␊
        fn pause(e: &Env, caller: Address) {␊
            pausable::pause(e);␊
        }␊
    ␊
        #[only_role(caller, "pauser")]␊
        fn unpause(e: &Env, caller: Address) {␊
            pausable::unpause(e);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl AccessControl for MyToken {}␊
    `

## fungible full - complex name

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Stellar Soroban Contracts ^0.3.0␊
    #![no_std]␊
    ␊
    use soroban_sdk::{Address, contract, contractimpl, Env, String};␊
    use stellar_default_impl_macro::default_impl;␊
    use stellar_fungible::{Base, burnable::FungibleBurnable, FungibleToken};␊
    use stellar_ownable::{self as ownable, Ownable};␊
    use stellar_ownable_macro::only_owner;␊
    use stellar_pausable::{self as pausable, Pausable};␊
    use stellar_pausable_macros::when_not_paused;␊
    ␊
    #[contract]␊
    pub struct CustomToken;␊
    ␊
    #[contractimpl]␊
    impl CustomToken {␊
        pub fn __constructor(e: &Env, recipient: Address, owner: Address) {␊
            Base::set_metadata(e, 18, String::from_str(e, "Custom  $ Token"), String::from_str(e, "MTK"));␊
            Base::mint(e, &recipient, 2000000000000000000000);␊
            ownable::set_owner(e, &owner);␊
        }␊
    ␊
        #[only_owner]␊
        #[when_not_paused]␊
        pub fn mint(e: &Env, account: Address, amount: i128) {␊
            Base::mint(e, &account, amount);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl FungibleToken for CustomToken {␊
        type ContractType = Base;␊
    ␊
        #[when_not_paused]␊
        fn transfer(e: &Env, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer(e, &from, &to, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, amount: i128) {␊
            Self::ContractType::transfer_from(e, &spender, &from, &to, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Extensions␊
    //␊
    ␊
    #[contractimpl]␊
    impl FungibleBurnable for CustomToken {␊
        #[when_not_paused]␊
        fn burn(e: &Env, from: Address, amount: i128) {␊
            Base::burn(e, &from, amount);␊
        }␊
    ␊
        #[when_not_paused]␊
        fn burn_from(e: &Env, spender: Address, from: Address, amount: i128) {␊
            Base::burn_from(e, &spender, &from, amount);␊
        }␊
    }␊
    ␊
    //␊
    // Utils␊
    //␊
    ␊
    #[contractimpl]␊
    impl Pausable for CustomToken {␊
        fn paused(e: &Env) -> bool {␊
            pausable::paused(e)␊
        }␊
    ␊
        #[only_owner]␊
        fn pause(e: &Env, caller: Address) {␊
            pausable::pause(e);␊
        }␊
    ␊
        #[only_owner]␊
        fn unpause(e: &Env, caller: Address) {␊
            pausable::unpause(e);␊
        }␊
    }␊
    ␊
    #[default_impl]␊
    #[contractimpl]␊
    impl Ownable for CustomToken {}␊
    `
