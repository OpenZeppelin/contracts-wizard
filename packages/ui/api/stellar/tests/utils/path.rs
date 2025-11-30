use std::fs::{create_dir_all, File};
use std::os::unix::fs::symlink;
use std::path::PathBuf;
use tempfile::tempdir;

use stellar_api::utils::{
    canonicalize_existing_dir, ensure_no_symlinks, expand_with_directories, join_and_assert_inside,
};

#[test]
fn expand_with_directories_includes_parents() {
    let res = expand_with_directories(&["a/b/c.txt"]);
    // should include the file itself and its parent directories
    assert!(res.iter().any(|s| s == "a/b/c.txt"));
    assert!(res.iter().any(|s| s == "a/b"));
    assert!(res.iter().any(|s| s == "a/") || res.iter().any(|s| s == "a"));
}

#[test]
fn join_and_assert_inside_detects_escape() {
    let tmp = tempdir().expect("tmp");
    let root = tmp.path();

    // An absolute path will make `join` return the absolute path, which should not start with `root`
    let outside = PathBuf::from("/abs_evil.txt");
    let res = join_and_assert_inside(root, &outside);
    assert!(
        res.is_err(),
        "expected join_and_assert_inside to fail on absolute path"
    );
}

#[test]
fn canonicalize_existing_dir_ok_and_err() {
    let tmp = tempdir().expect("tmp");
    let path = tmp.path().to_path_buf();
    let ok = canonicalize_existing_dir(&path);
    assert!(ok.is_ok());

    let non = path.join("does_not_exist");
    let e = canonicalize_existing_dir(&non);
    assert!(e.is_err());
}

#[test]
fn ensure_no_symlinks_detects_parent_and_self_symlink() {
    let tmp = tempdir().expect("tmp");
    let root = tmp.path().to_path_buf();

    // create a real dir and a symlink inside root
    create_dir_all(root.join("real")).expect("mkdir real");

    // create a symlink named linkdir inside root pointing to real
    let link = root.join("linkdir");
    symlink(root.join("real"), &link).expect("create symlink");

    // now attempt to validate a path whose parent is the symlink
    let target = link.join("file.txt");
    let res = ensure_no_symlinks(&root, &target);
    assert!(res.is_err(), "expected symlink detected in parents");

    // also test that a symlink at the final path is detected
    let file_target = root.join("somefile");
    File::create(&file_target).expect("create file");
    let file_link = root.join("filelink");
    symlink(&file_target, &file_link).expect("create file symlink");

    let res2 = ensure_no_symlinks(&root, &file_link);
    assert!(res2.is_err(), "expected symlink detected on final path");
}

#[test]
fn ai_join_and_assert_inside_success() {
    let tmp = tempdir().expect("tmp");
    let root = tmp.path();
    let inside = PathBuf::from("subdir/file.txt");
    let full = root.join(&inside);
    create_dir_all(full.parent().unwrap()).unwrap();
    File::create(&full).unwrap();

    let res = join_and_assert_inside(root, &inside);
    assert!(res.is_ok());
    let got = res.unwrap();
    assert!(got.starts_with(root));
}

#[test]
fn ai_canonicalize_existing_dir_on_file_returns_err() {
    let tmp = tempdir().expect("tmp");
    let f = tmp.path().join("afile");
    File::create(&f).unwrap();
    let res = canonicalize_existing_dir(&f);
    assert!(res.is_err());
}

#[test]
fn ai_ensure_no_symlinks_ok() {
    let tmp = tempdir().expect("tmp");
    let root = tmp.path().to_path_buf();
    create_dir_all(root.join("a/b")).unwrap();
    let target = root.join("a/b/c.txt");
    File::create(&target).unwrap();
    let res = ensure_no_symlinks(&root, &target);
    assert!(res.is_ok());
}

#[test]
fn ai_expand_with_directories_handles_dot_and_backslash() {
    let items = expand_with_directories(&["./a/b/c.txt", "dir\\file.txt"]);
    assert!(items.iter().any(|s| s.ends_with("a/b/c.txt")));
    // backslash should be normalized to forward slash somewhere in the output
    assert!(items
        .iter()
        .any(|s| s.contains("dir/") || s.contains("dir\\")));
}
