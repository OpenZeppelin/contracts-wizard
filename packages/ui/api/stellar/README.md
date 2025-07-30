 # Stellar Backend (Actix-web)

 This is a minimal "Hello, world!" HTTP service built with Rust and Actix-web.

 ## Local Run

 ```bash
 cd packages/ui/api/stellar
 cargo run --release
 ```

 The server listens on port 5000.

 ## Docker

 ```bash
 docker build -t stellar packages/ui/api/stellar
 docker run -p 5000:5000 stellar
 ```