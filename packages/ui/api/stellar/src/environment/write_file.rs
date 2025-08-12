use std::fs;
use std::io;
use std::path::Path;

pub fn write_file(root: &Path, rel: &str, contents: &str) -> io::Result<()> {
    let path = root.join(rel);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(path, contents.as_bytes())
}
