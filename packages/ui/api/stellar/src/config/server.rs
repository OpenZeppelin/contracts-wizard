use std::env;

#[derive(Debug, Clone)]
pub struct ServerConfig {
    /// The host address the server will bind to.
    pub host: String,
    /// The port number the server will listen on.
    pub port: u16,
    /// The number of requests allowed per second.
    pub rate_limit_requests_per_second: u64,
    /// Origin of the Wizard web application.
    pub wizard_origin: String,
}

impl ServerConfig {
    /// Creates a new `ServerConfig` instance from environment variables.
    ///
    /// # Defaults
    ///
    /// - `HOST` defaults to `"0.0.0.0"`.
    /// - `APP_PORT` defaults to `8080`.
    /// - `RATE_LIMIT_REQUESTS_PER_SECOND` defaults to `100`.
    pub fn from_environment_variables() -> Self {
        Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("APP_PORT")
                .unwrap_or_else(|_| "8888".to_string())
                .parse()
                .unwrap_or(8080),
            rate_limit_requests_per_second: env::var("RATE_LIMIT_REQUESTS_PER_SECOND")
                .unwrap_or_else(|_| "100".to_string())
                .parse()
                .unwrap_or(100),
            wizard_origin: env::var("WIZARD_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:8080".to_string()),
        }
    }
}
