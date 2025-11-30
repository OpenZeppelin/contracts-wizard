use std::env;
use std::fs::{create_dir_all, File};
use std::io::Write;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;
use std::sync::Mutex;

use tempfile::tempdir;

use stellar_api::environment::run_scaffold_upgrade_command;

static PATH_LOCK: Mutex<()> = Mutex::new(());

fn make_fake_stellar(dir: &Path, exit_code: i32, stderr: Option<&str>) -> std::path::PathBuf {
    let path = dir.join("stellar");
    let mut f = File::create(&path).expect("create exe");
    writeln!(f, "#!/bin/sh").unwrap();
    if let Some(s) = stderr {
        writeln!(f, "echo '{}' 1>&2", s).unwrap();
    }
    writeln!(f, "exit {}", exit_code).unwrap();
    let mut perms = f.metadata().unwrap().permissions();
    perms.set_mode(0o755);
    std::fs::set_permissions(&path, perms).unwrap();
    path
}

#[test]
fn run_scaffold_upgrade_command_success() {
    let tmp = tempdir().expect("tmp");
    let bin_dir = tmp.path().join("bin");
    create_dir_all(&bin_dir).expect("mkdir bin");
    let stellar_path = make_fake_stellar(&bin_dir, 0, None);

    // Prepend our bin_dir to PATH for the duration of the test
    let _guard = PATH_LOCK.lock().unwrap();
    let old_path = env::var_os("PATH");
    let new_path = format!(
        "{}:{}",
        bin_dir.display(),
        env::var("PATH").unwrap_or_default()
    );
    env::set_var("PATH", &new_path);

    // create a dummy project dir
    let proj = tempdir().expect("proj");
    let res = run_scaffold_upgrade_command(proj.path());

    // restore PATH
    if let Some(v) = old_path {
        env::set_var("PATH", v);
    }
    drop(_guard);

    assert!(
        res.is_ok(),
        "expected command to succeed, stellar at {}",
        stellar_path.display()
    );
}

#[test]
fn run_scaffold_upgrade_command_failure_propagates_error() {
    let tmp = tempdir().expect("tmp");
    let bin_dir = tmp.path().join("bin");
    create_dir_all(&bin_dir).expect("mkdir bin");
    let _stellar_path = make_fake_stellar(&bin_dir, 2, Some("failure"));

    // Prepend our bin_dir to PATH for the duration of the test
    let _guard = PATH_LOCK.lock().unwrap();
    let old_path = env::var_os("PATH");
    let new_path = format!(
        "{}:{}",
        bin_dir.display(),
        env::var("PATH").unwrap_or_default()
    );
    env::set_var("PATH", &new_path);

    let proj = tempdir().expect("proj");
    let res = run_scaffold_upgrade_command(proj.path());

    // restore PATH
    if let Some(v) = old_path {
        env::set_var("PATH", v);
    }
    drop(_guard);

    assert!(res.is_err(), "expected command to fail and return Err");
}
