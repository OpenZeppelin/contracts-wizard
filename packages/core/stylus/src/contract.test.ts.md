# Snapshot report for `src/contract.test.ts`

The actual snapshot is saved in `contract.test.ts.snap`.

Generated by [AVA](https://avajs.dev).

## contract basics

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {}␊
    ␊
    #[public]␊
    #[inherit]␊
    impl Foo {}␊
    `

## contract with function code before

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use mod_ext::External;␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {␊
        #[borrow]␊
        external: External,␊
    }␊
    ␊
    #[public]␊
    #[inherit(External)]␊
    impl Foo {␊
        fn someFunction() {␊
            before();␊
            someFunction();␊
        }␊
    }␊
    `

## contract with standalone import

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use some::library::SomeLibrary;␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {}␊
    ␊
    #[public]␊
    #[inherit]␊
    impl Foo {}␊
    `

## contract with grouped imports

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use some::library::{Misc, SomeLibrary};␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {}␊
    ␊
    #[public]␊
    #[inherit]␊
    impl Foo {}␊
    `

## contract with sorted use clauses

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use another::library::{AnotherLibrary, Foo as Custom1, Foo as Custom2};␊
    use some::library::SomeLibrary;␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {}␊
    ␊
    #[public]␊
    #[inherit]␊
    impl Foo {}␊
    `

## contract with sorted traits

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use mod_a::A;␊
    use mod_b::B;␊
    use mod_special::Special;␊
    use mod_z::Z;␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {␊
        #[borrow]␊
        a: A,␊
        #[borrow]␊
        b: B,␊
        #[borrow]␊
        z: Z,␊
        #[borrow]␊
        special: Special,␊
    }␊
    ␊
    #[public]␊
    #[inherit(A, B, Z, Special)]␊
    impl Foo {␊
        fn funcA() {}␊
    ␊
        fn funcB() {}␊
    ␊
        fn funcZ() {}␊
    ␊
        //␊
        // Special Section␊
        //␊
    ␊
        fn funcSpecial() {}␊
    }␊
    `

## contract with documentation

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    //! Some documentation␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {}␊
    ␊
    #[public]␊
    #[inherit]␊
    impl Foo {}␊
    `

## contract with security info

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    ␊
    //! # Security␊
    //!␊
    //! For security issues, please contact: security@example.com␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {}␊
    ␊
    #[public]␊
    #[inherit]␊
    impl Foo {}␊
    `

## contract with security info and documentation

> Snapshot 1

    `// SPDX-License-Identifier: MIT␊
    // Compatible with OpenZeppelin Contracts for Stylus ^0.2.0-alpha.4␊
    //! Some documentation␊
    ␊
    //! # Security␊
    //!␊
    //! For security issues, please contact: security@example.com␊
    ␊
    #![cfg_attr(not(any(test, feature = "export-abi")), no_main)]␊
    extern crate alloc;␊
    ␊
    use stylus_sdk::prelude::*;␊
    ␊
    #[entrypoint]␊
    #[storage]␊
    struct Foo {}␊
    ␊
    #[public]␊
    #[inherit]␊
    impl Foo {}␊
    `
