use std::path::Path;
use std::{
    io::Error,
    process::{Command, ExitStatus, Stdio},
};

pub fn run_scaffold_upgrade_command(project_dir_path: &Path) -> Result<ExitStatus, Error> {
    Command::new("stellar")
        .args(["scaffold", "upgrade", "--skip-prompt"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::inherit())
        .current_dir(project_dir_path)
        .status()
}
