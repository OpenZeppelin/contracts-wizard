use std::path::Path;
use std::{
    io::Error,
    process::{Command, Stdio},
};

pub fn run_scaffold_upgrade_command(project_dir_path: &Path) -> Result<(), Error> {
    let output = Command::new("stellar")
        .args(["scaffold", "upgrade", "--skip-prompt"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .current_dir(project_dir_path)
        .output()?;

    if output.status.success() {
        Ok(())
    } else {
        Err(Error::other(format!(
            "'stellar scaffold upgrade' failed with code {:?}: {}",
            output.status.code(),
            String::from_utf8_lossy(&output.stderr)
        )))
    }
}
