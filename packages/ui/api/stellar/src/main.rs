 use actix_web::{get, App, HttpServer, Responder};

 #[get("/")]
 async fn hello() -> impl Responder {
     "Hello, world!"
 }

 #[actix_web::main]
 async fn main() -> std::io::Result<()> {
     println!("Starting server at http://0.0.0.0:5000");
     HttpServer::new(|| App::new().service(hello))
         .bind(("0.0.0.0", 5000))?
         .run()
         .await
 }