use std::{fs, os::unix::fs::PermissionsExt};
use stellar_api::environment::write_file;
use tempfile;

fn temp_dir() -> tempfile::TempDir {
    tempfile::tempdir().expect("Failed to create temp dir")
}

#[test]
fn test_write_file_existing_directory() {
    let tmp_dir = temp_dir();
    let tmp_dir_path = tmp_dir.path();
    let file_name = "test.txt";
    let contents = "Hello, world!";
    let file_path = tmp_dir_path.join(file_name);

    let result = write_file(&tmp_dir_path, file_name, contents);
    assert!(result.is_ok());

    let read_contents = fs::read_to_string(file_path).unwrap();
    assert_eq!(read_contents, contents);
}

#[test]
fn test_write_file_creates_parent_directories() {
    let tmp_dir = temp_dir();
    let tmp_dir_path = tmp_dir.path();
    let rel_path = "nested/dir/test.txt";
    let contents = "Nested content!";
    let file_path = tmp_dir_path.join(rel_path);

    let result = write_file(&tmp_dir_path, rel_path, contents);
    assert!(result.is_ok());

    let read_contents = fs::read_to_string(file_path).unwrap();
    assert_eq!(read_contents, contents);
}

#[test]
fn test_write_file_overwrites_existing_file() {
    let tmp_dir = temp_dir();
    let tmp_dir_path = tmp_dir.path();
    let file_name = "overwrite.txt";
    let initial_contents = "Initial";
    let new_contents = "Overwritten";

    let file_path = tmp_dir_path.join(file_name);
    fs::write(&file_path, initial_contents).unwrap();

    let result = write_file(&tmp_dir_path, file_name, new_contents);
    assert!(result.is_ok());

    let read_contents = fs::read_to_string(file_path).unwrap();
    assert_eq!(read_contents, new_contents);
}

#[test]
fn test_write_file_permission_denied() {
    let tmp_dir = temp_dir();
    let tmp_dir_path = tmp_dir.path();
    let subdir = tmp_dir_path.join("no_write");
    fs::create_dir_all(&subdir).unwrap();
    let file_name = "file.txt";
    let contents = "No permission";

    // Remove write permissions from the directory
    let mut perms = fs::metadata(&subdir).unwrap().permissions();
    perms.set_mode(0o555); // read and execute only
    fs::set_permissions(&subdir, perms.clone()).unwrap();

    let result = write_file(&subdir, file_name, contents);

    assert!(result.is_err());
}

#[test]
fn test_write_file_invalid_path() {
    let tmp_dir = temp_dir();
    let tmp_dir_path = tmp_dir.path();
    // Use an invalid path (contains null byte)
    let rel_path = "invalid\0path.txt";
    let contents = "Invalid path";

    let result = write_file(&tmp_dir_path, rel_path, contents);

    assert!(result.is_err());
}
