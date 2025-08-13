use crate::utils::{
    build_globset, canonicalize_existing_dir, check_glob_match, sanitize_destination_path,
    to_zip_io_error,
};
use std::fs::{read, File};
use std::io::{self, Cursor, Read, Seek, Write};
use std::path::Path;
use tempfile::{NamedTempFile, TempDir};
use walkdir::WalkDir;
use zip::{
    result::{ZipError, ZipResult},
    write::FileOptions,
    CompressionMethod, ZipArchive, ZipWriter,
};

pub fn unzip_in_temporary_folder(
    zip_data: Vec<u8>,
    expected_files: &[&str],
) -> Result<TempDir, ZipError> {
    let mut temp_zip = NamedTempFile::new().map_err(to_zip_io_error)?;

    temp_zip.write_all(&zip_data).map_err(to_zip_io_error)?;

    let temp_dir = TempDir::new().map_err(to_zip_io_error)?;

    let file = File::open(temp_zip.path()).map_err(to_zip_io_error)?;

    let mut archive = ZipArchive::new(file).map_err(to_zip_io_error)?;

    secure_zip_extract(&mut archive, temp_dir.path(), expected_files).map_err(to_zip_io_error)?;

    Ok(temp_dir)
}

fn secure_zip_extract<R: Read + io::Seek>(
    archive: &mut ZipArchive<R>,
    destination_path: &Path,
    expected_files: &[&str],
) -> Result<(), ZipError> {
    let zip_destination = canonicalize_existing_dir(destination_path).map_err(to_zip_io_error)?;

    let expected_globset = build_globset(expected_files).map_err(to_zip_io_error)?;

    if archive.len() > expected_files.len() {
        return Err(zip::result::ZipError::UnsupportedArchive(
            "Unexpected zip content",
        ));
    }

    for i in 0..archive.len() {
        let entry = archive.by_index(i).map_err(to_zip_io_error)?;

        let entry_path = entry
            .enclosed_name()
            .ok_or("Unsafe path")
            .map_err(to_zip_io_error)?;

        let path_str = entry_path
            .to_str()
            .ok_or("Invalid entry Path")
            .map_err(to_zip_io_error)?;

        check_glob_match(&expected_globset, path_str).map_err(to_zip_io_error)?;

        if entry.encrypted() {
            return Err(ZipError::UnsupportedArchive(
                "Encrypted entries are not allowed",
            ));
        }

        if entry.is_symlink() {
            return Err(ZipError::UnsupportedArchive(
                "Symlink entries are not allowed",
            ));
        }

        sanitize_destination_path(&zip_destination, &entry_path).map_err(to_zip_io_error)?;
    }

    archive.extract(destination_path).map_err(to_zip_io_error)?;

    Ok(())
}

pub fn zip_directory(zip_path: &Path) -> ZipResult<Vec<u8>> {
    let mut zip_result = Vec::new();

    {
        let mut zip_writer = ZipWriter::new(Cursor::new(&mut zip_result));
        let compression_options = default_options();

        for entry in WalkDir::new(zip_path).into_iter().filter_map(Result::ok) {
            let path = entry.path();
            let is_dir = path.is_dir();
            let root_path = path.strip_prefix(zip_path).unwrap();

            if root_path.as_os_str().is_empty() {
                continue;
            }

            let normalized_root_path = normalize_path(root_path);

            if is_dir {
                add_directory(&mut zip_writer, &normalized_root_path, compression_options)?;
            } else {
                add_file(
                    &mut zip_writer,
                    path,
                    &normalized_root_path,
                    compression_options,
                )?;
            }
        }

        zip_writer.finish()?;
    }

    Ok(zip_result)
}

fn normalize_path(p: &Path) -> String {
    p.to_string_lossy().replace('\\', "/")
}

fn default_options() -> FileOptions<'static, ()> {
    FileOptions::default()
        .compression_method(CompressionMethod::Deflate64)
        .unix_permissions(0o755)
}

fn add_directory<W: Write + Seek>(
    zip: &mut ZipWriter<W>,
    name: &str,
    options: FileOptions<()>,
) -> ZipResult<()> {
    let mut dir = name.to_string();
    if !dir.ends_with('/') {
        dir.push('/');
    }
    zip.add_directory(dir, options)
}

fn add_file<W: Write + Seek>(
    zip: &mut ZipWriter<W>,
    src_path: &Path,
    root_path: &str,
    options: FileOptions<()>,
) -> Result<(), ZipError> {
    zip.start_file(root_path, options)?;
    let bytes = read(src_path).map_err(to_zip_io_error)?;
    zip.write_all(&bytes).map_err(to_zip_io_error)
}
