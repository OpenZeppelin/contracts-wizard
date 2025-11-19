use actix_web::{test, App};
use stellar_api::routes::health::init;

#[actix_web::test]
async fn test_health_endpoint() {
    let app = test::init_service(App::new().configure(init)).await;

    let req = test::TestRequest::get().uri("/health").to_request();
    let resp = test::call_service(&app, req).await;

    assert!(resp.status().is_success());

    let body = test::read_body(resp).await;
    assert_eq!(body, "OK");
}
