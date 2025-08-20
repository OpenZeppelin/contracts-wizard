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

// fn deny_abs(p: &Path) -> Result<(), IoError> {
//     if p.is_absolute() {
//         Err(IoError::other("absolute path rejected"))
//     } else {
//         Ok(())
//     }
// }

// pub fn sanitize_destination_path(root_path: &Path, entry_path: &Path) -> Result<PathBuf, IoError> {
//     if !root_path.is_absolute() {
//         return Err(IoError::other("root must be absolute"));
//     }
//     deny_abs(entry_path)?;
//     scoped_join(root_path, entry_path).map_err(|e| IoError::other(format!("unsafe path: {e}")))
// }
