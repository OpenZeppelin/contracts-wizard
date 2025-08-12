use std::fs;
use std::io::{Cursor, Seek, Write};
use std::path::Path;
use walkdir::WalkDir;
use zip::{
    result::{ZipError, ZipResult},
    write::FileOptions,
    CompressionMethod, ZipWriter,
};

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

            let normalized_root_path = normalize_path(&root_path);

            if is_dir {
                add_directory(&mut zip_writer, &normalized_root_path, compression_options)?;
            } else {
                add_file(
                    &mut zip_writer,
                    &path,
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
    // ensure trailing slash for directories in the zip
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
    let bytes = fs::read(src_path).map_err(ZipError::Io)?;
    zip.write_all(&bytes).map_err(ZipError::Io)
}
