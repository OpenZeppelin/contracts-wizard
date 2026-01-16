use stellar_api::utils::{to_http_hidden_error, to_io_error, to_zip_io_error};
use zip::result::ZipError;

#[test]
fn ai_to_io_and_zip_and_http_error_behaviour() {
    let io_err = to_io_error("disk full");
    let io_str = format!("{:?}", io_err);
    assert!(io_str.contains("disk full"));

    let zip_err = to_zip_io_error("zip fail");
    match zip_err {
        ZipError::Io(e) => assert!(format!("{:?}", e).contains("zip fail")),
        _ => panic!("expected ZipError::Io"),
    }

    let http_err = to_http_hidden_error("hidden");
    // Ensure we have an actix_web::Error value by formatting it
    let h = format!("{:?}", http_err);
    assert!(h.contains("Internal Server Error"));
}
