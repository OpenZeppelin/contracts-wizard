use std::fs::canonicalize;
use std::io::Error as IoError;
use std::path::{Path, PathBuf};

pub fn canonicalize_existing_dir(dir: &Path) -> Result<PathBuf, IoError> {
    if dir.exists() {
        let can_path = canonicalize(dir)?;
        if !can_path.is_dir() {
            return Err(IoError::other("destination is not a directory"));
        }

        return Ok(can_path);
    }

    Err(IoError::other("Directory does not exist"))
}

pub fn sanitize_destination_path(
    root_path: &Path,
    entry_path: &Path,
) -> Result<PathBuf, std::io::Error> {
    let destination_path = root_path.join(entry_path);

    let canonical_root = root_path.canonicalize()?;
    let canonical_destination_path = destination_path.canonicalize()?;

    if !canonical_destination_path.starts_with(&canonical_root) {
        return Err(IoError::other(
            "Invalid destination path outside of root directory",
        ));
    }
    Ok(canonical_destination_path)
}
