use actix_web::web;
use stellar_api::controllers::upgrade_to_scaffold;

#[actix_rt::test]
async fn ai_upgrade_to_scaffold_invalid_zip_returns_err() {
    // invalid bytes should cause upgrade_to_scaffold to return an Err
    let bad = web::Bytes::from_static(&[0u8, 1, 2, 3]);
    let res = upgrade_to_scaffold(bad).await;
    assert!(res.is_err(), "expected error for invalid zip");
}
