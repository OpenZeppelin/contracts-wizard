use std::collections::HashSet;
use std::fs::{canonicalize, symlink_metadata};
use std::io::{Error as IoError, ErrorKind as IoErrorKind, Result as IoResult};
use std::path::{Component, Path, PathBuf};

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

fn norm(s: &str) -> String {
    let mut v = s.replace('\\', "/");
    if let Some(x) = v.strip_prefix("./") {
        v = x.to_string();
    }
    v
}

fn ancestors_rel(p: &str) -> impl Iterator<Item = String> + '_ {
    Path::new(p)
        .ancestors()
        .skip(1) // parents only, not the full path
        .take_while(|a| !a.as_os_str().is_empty())
        .map(|a| a.components()
             .filter(|c| !matches!(c, Component::CurDir))
             .collect::<std::path::PathBuf>()
             .to_string_lossy()
             .into_owned())
}

pub fn expand_with_directories(patterns: &[&str]) -> Vec<String> {
    let set: HashSet<String> = patterns
        .iter()
        .map(|p| norm(p))
        .flat_map(|p| {
            let mut v = Vec::new();
            v.push(p.clone());
            for d in ancestors_rel(&p) {
                v.push(d.clone());
                v.push(format!("{d}/"));
            }
            v
        })
        .collect();
    set.into_iter().collect()
}

pub fn join_and_assert_inside(root: &Path, rel: &Path) -> Result<PathBuf, IoError> {
    let full = root.join(rel);
    if !full.starts_with(root) {
        return Err(IoError::other("Path escape root"));
    }
    Ok(full)
}

pub fn ensure_no_symlinks(root: &Path, path: &Path) -> IoResult<()> {
    let rel = path
        .strip_prefix(root)
        .map_err(|_| IoError::other("path escapes root"))?;

    let parents = rel.parent().unwrap_or(Path::new(""));

    parents
        .components()
        .scan(root.to_path_buf(), |acc: &mut PathBuf, c| {
            acc.push(c);
            Some(acc.clone())
        })
        .try_for_each(|p| {
            let ft = symlink_metadata(&p)?.file_type();
            if ft.is_symlink() {
                Err(IoError::other("symlink detected"))
            } else {
                Ok(())
            }
        })?;

    match std::fs::symlink_metadata(path) {
        Ok(meta) if meta.file_type().is_symlink() => {
            return Err(IoError::other("symlink detected"))
        }
        Err(e) if e.kind() == IoErrorKind::NotFound => {}
        Err(e) => return Err(e),
        _ => {}
    }

    Ok(())
}
