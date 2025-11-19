use crate::utils::{ensure_no_symlinks, to_io_error};
use std::fs::{DirBuilder, OpenOptions};
use std::io::{copy, Error as IoError, Read, Take};
use std::os::unix::fs::DirBuilderExt;
use std::path::Path;

pub fn create_dir_safe(path: &Path) -> Result<(), IoError> {
    // 0o700 on Unix. On non-Unix, this compiles but ignores mode.
    #[cfg(unix)]
    {
        use DirBuilderExt;
        let mut b = DirBuilder::new();
        b.recursive(true)
            .mode(0o700)
            .create(path)
            .map_err(to_io_error)
    }
    #[cfg(not(unix))]
    {
        fs::create_dir_all(path).map_err(utils::to_io_error::to_io_error)
    }
}

pub fn write_file_safe<R: Read>(
    target: &Path,
    root: &Path,
    file_size: u64,
    file_take: &mut Take<R>,
) -> Result<(), IoError> {
    ensure_no_symlinks(root, target).map_err(to_io_error)?;

    let mut file = {
        let mut open_option = OpenOptions::new();
        open_option.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            open_option.custom_flags(libc::O_NOFOLLOW);
            open_option.mode(0o600);
        }
        open_option.open(target).map_err(to_io_error)?
    };

    let written = copy(file_take, &mut file).map_err(to_io_error)?;
    if written != file_size {
        return Err(IoError::other("size mismatch"));
    }
    Ok(())
}
