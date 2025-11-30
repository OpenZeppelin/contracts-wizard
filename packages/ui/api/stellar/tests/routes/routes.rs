use actix_web::{test, App};
use stellar_api::routes::configure_routes;

#[actix_rt::test]
async fn ai_routes_configure_executes() {
    // Simply configure the app with our routes to exercise `routes::configure_routes`.
    let _app = test::init_service(App::new().configure(|cfg| configure_routes(cfg))).await;
    // If configure runs without panic we've executed the code paths in `routes/mod.rs`.
    assert!(true);
}

#[actix_rt::test]
async fn ai_routes_configure_registers_routes() {
    let app = test::init_service(App::new().configure(stellar_api::routes::configure_routes)).await;

    // health endpoint should return 200
    let req = test::TestRequest::get().uri("/health").to_request();
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status().as_u16(), 200);

    // POST invalid bytes to upgrade-scaffold should return 415
    let req = test::TestRequest::post()
        .uri("/upgrade-scaffold")
        .set_payload(vec![0u8, 1, 2])
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status().as_u16(), 415);
}
