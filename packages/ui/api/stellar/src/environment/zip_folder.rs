use crate::utils::{
    build_globset, create_dir_safe, expand_with_directories, is_glob_match, join_and_assert_inside,
    to_zip_io_error, write_file_safe,
};
use std::collections::HashSet;
use std::fs::{read, File};
use std::io::{self, Cursor, Read, Seek, Write};
use std::path::{Component, Path, PathBuf};
use tempfile::{NamedTempFile, TempDir};
use walkdir::WalkDir;
use zip::{
    read::ZipFile,
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

    secure_zip_extract(&mut archive, temp_dir.path(), expected_files)?;

    Ok(temp_dir)
}

fn secure_zip_extract<R: Read + io::Seek>(
    archive: &mut ZipArchive<R>,
    destination_path: &Path,
    expected_files: &[&str],
) -> Result<(), ZipError> {
    validate_archive_structure(archive, expected_files)?;

    let expected_globset =
        build_globset(expand_with_directories(expected_files)).map_err(to_zip_io_error)?;
    let mut seen_paths: HashSet<String> = HashSet::with_capacity(archive.len());

    let mut total_uncompressed: u64 = 0;

    for i in 0..archive.len() {
        let entry = archive.by_index(i)?;

        let validated_entry = validate_entry_metadata(&entry)?;

        let entry_path = normalize_entry_path(&entry)?;

        validate_and_register_entry(&validated_entry, &expected_globset, &mut seen_paths)?;

        let target_full_path = join_and_assert_inside(destination_path, entry_path.as_path())?;

        if entry.is_dir() {
            create_dir_safe(&target_full_path).map_err(to_zip_io_error)?;
            continue;
        }

        total_uncompressed =
            validate_entry_size(&entry, total_uncompressed, &ZipEntryLimits::rust_env())?;

        if let Some(parent) = target_full_path.parent() {
            create_dir_safe(parent)?;
        }

        let size = entry.size();
        let mut limited_reader = entry.take(size);
        write_file_safe(
            &target_full_path,
            destination_path,
            size,
            &mut limited_reader,
        )?;
    }

    Ok(())
}

fn validate_and_register_entry(
    entry_path: &str,
    expected_globset: &globset::GlobSet,
    seen_paths: &mut HashSet<String>,
) -> Result<(), ZipError> {
    if seen_paths.contains(entry_path) {
        return Err(ZipError::UnsupportedArchive("duplicate entry"));
    }

    if is_glob_match(expected_globset, entry_path).is_err() {
        return Err(ZipError::UnsupportedArchive("Unexpected zip content"));
    }

    seen_paths.insert(entry_path.to_owned());

    Ok(())
}

fn normalize_entry_path<R: Read + io::Seek>(entry: &ZipFile<R>) -> Result<PathBuf, ZipError> {
    let p = entry
        .enclosed_name()
        .ok_or_else(|| to_zip_io_error("invalid entry name"))?;
    if p.is_absolute()
        || p.components()
            .any(|c| matches!(c, Component::Prefix { .. }))
    {
        return Err(ZipError::UnsupportedArchive("absolute or prefix path"));
    }
    Ok(p.to_path_buf())
}

pub struct ZipEntryLimits {
    pub max_total_uncompressed: u64,
    pub max_file_uncompressed: u64,
    pub max_compression_ratio: u64,
}

impl ZipEntryLimits {
    pub const fn rust_env() -> Self {
        Self {
            max_total_uncompressed: 100 * 1024, // 100 KB
            max_file_uncompressed: 50 * 1024,   // 50 KB
            max_compression_ratio: 200,
        }
    }
}

fn validate_entry_size<R: Read + io::Seek>(
    entry: &ZipFile<R>,
    total_uncompressed: u64,
    zip_entry_limits: &ZipEntryLimits,
) -> Result<u64, ZipError> {
    let uncompressed = entry.size();
    let compressed = entry.compressed_size();

    if uncompressed > zip_entry_limits.max_file_uncompressed {
        return Err(ZipError::UnsupportedArchive("entry too large"));
    }

    let new_total = total_uncompressed
        .checked_add(uncompressed)
        .ok_or_else(|| to_zip_io_error("Size overflow"))?;
    if new_total > zip_entry_limits.max_total_uncompressed {
        return Err(ZipError::UnsupportedArchive("archive too large"));
    }

    if compressed.saturating_mul(zip_entry_limits.max_compression_ratio) < uncompressed {
        return Err(ZipError::UnsupportedArchive("suspicious compression ratio"));
    }

    Ok(new_total)
}

fn validate_archive_structure<R: Read + io::Seek>(
    archive: &ZipArchive<R>,
    expected_files: &[&str],
) -> Result<(), ZipError> {
    if archive.len() != expected_entry_count(expected_files) {
        return Err(ZipError::UnsupportedArchive("Unexpected zip file"));
    }

    Ok(())
}

fn ancestors_rel(p: &Path) -> impl Iterator<Item = PathBuf> + '_ {
    p.ancestors()
        .take_while(|a| !a.as_os_str().is_empty())
        .map(Path::to_path_buf)
}

pub fn expected_entry_count(file_globs: &[&str]) -> usize {
    file_globs
        .iter()
        .flat_map(|pat| ancestors_rel(Path::new(pat)))
        .collect::<HashSet<PathBuf>>()
        .len()
}

fn validate_entry_metadata<R: Read + io::Seek>(entry: &ZipFile<R>) -> Result<String, ZipError> {
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

    match entry.compression() {
        CompressionMethod::Stored | CompressionMethod::Deflated => {}
        _ => {
            return Err(ZipError::UnsupportedArchive(
                "Unsupported compression method",
            ))
        }
    }

    let entry_path = entry
        .enclosed_name()
        .and_then(|p| p.to_str().map(|s| s.to_owned()))
        .ok_or_else(|| to_zip_io_error("invalid entry name"))?;

    Ok(entry_path)
}

//EvLUATE WHAT CAN BE EXTRACTED FROM SPECIFIC RUST ENV PROCESS
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
                add_directory_to_zip(&mut zip_writer, &normalized_root_path, compression_options)?;
            } else {
                add_file_to_zip(
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
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o755)
}

fn add_directory_to_zip<W: Write + Seek>(
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

fn add_file_to_zip<W: Write + Seek>(
    zip: &mut ZipWriter<W>,
    src_path: &Path,
    root_path: &str,
    options: FileOptions<()>,
) -> Result<(), ZipError> {
    zip.start_file(root_path, options)?;
    let bytes = read(src_path).map_err(to_zip_io_error)?;
    zip.write_all(&bytes).map_err(to_zip_io_error)
}
