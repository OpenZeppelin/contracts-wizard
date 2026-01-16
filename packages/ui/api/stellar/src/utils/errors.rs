use actix_web::{error::ErrorInternalServerError, Error as HttpError};
use log::error;
use std::fmt::Debug;
use std::io::Error as IOError;
use zip::result::ZipError;

pub fn to_http_hidden_error<E: Debug>(error: E) -> HttpError {
    error!("Internal error: {error:?}");
    ErrorInternalServerError("Internal Server Error")
}

pub fn to_io_error<E: Debug>(error: E) -> IOError {
    error!("IO error: {error:?}");
    IOError::other(format!("{error:?}"))
}

pub fn to_zip_io_error<E: Debug>(error: E) -> ZipError {
    error!("Zip error: {error:?}");
    ZipError::Io(IOError::other(format!("{error:?}")))
}
