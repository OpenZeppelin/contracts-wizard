use std::env;
use stellar_api::config::ServerConfig;

#[test]
fn ai_server_config_defaults_and_overrides() {
    // Clear environment vars we might affect
    let old_host = env::var_os("HOST");
    let old_port = env::var_os("APP_PORT");
    let old_rate = env::var_os("RATE_LIMIT_REQUESTS_PER_SECOND");
    let old_origin = env::var_os("WIZARD_ORIGIN");

    env::remove_var("HOST");
    env::remove_var("APP_PORT");
    env::remove_var("RATE_LIMIT_REQUESTS_PER_SECOND");
    env::remove_var("WIZARD_ORIGIN");

    let cfg = ServerConfig::from_environment_variables();
    assert_eq!(cfg.host, "0.0.0.0");
    // default port is parsed or fallback to 8888 in this crate
    assert!(cfg.port > 0);

    // Now set custom values
    env::set_var("HOST", "127.0.0.1");
    env::set_var("APP_PORT", "4242");
    env::set_var("RATE_LIMIT_REQUESTS_PER_SECOND", "7");
    env::set_var("WIZARD_ORIGIN", "https://example.test");

    let cfg2 = ServerConfig::from_environment_variables();
    assert_eq!(cfg2.host, "127.0.0.1");
    assert_eq!(cfg2.port, 4242);
    assert_eq!(cfg2.rate_limit_requests_per_second, 7);
    assert_eq!(cfg2.wizard_origin, "https://example.test");

    // restore
    if let Some(v) = old_host {
        env::set_var("HOST", v);
    } else {
        env::remove_var("HOST");
    }
    if let Some(v) = old_port {
        env::set_var("APP_PORT", v);
    } else {
        env::remove_var("APP_PORT");
    }
    if let Some(v) = old_rate {
        env::set_var("RATE_LIMIT_REQUESTS_PER_SECOND", v);
    } else {
        env::remove_var("RATE_LIMIT_REQUESTS_PER_SECOND");
    }
    if let Some(v) = old_origin {
        env::set_var("WIZARD_ORIGIN", v);
    } else {
        env::remove_var("WIZARD_ORIGIN");
    }
}
