use std::fs::read_to_string;
use std::io::{Cursor, Read};
use tempfile::tempdir;

use stellar_api::utils::{create_dir_safe, write_file_safe};

#[test]
fn ai_create_dir_safe_creates_nested() {
    let tmp = tempdir().expect("tmp");
    let path = tmp.path().join("a/b/c");
    let res = create_dir_safe(&path);
    assert!(res.is_ok());
    assert!(path.is_dir());
}

#[test]
fn ai_write_file_safe_writes_and_size_mismatch() {
    let tmp = tempdir().expect("tmp");
    let root = tmp.path();
    let target = root.join("file.bin");

    let data = b"hello";
    let mut reader = Cursor::new(data.as_ref()).take(data.len() as u64);

    let res = write_file_safe(&target, root, data.len() as u64, &mut reader);
    assert!(res.is_ok(), "expected write to succeed: {res:?}");

    let content = read_to_string(&target).expect("read file");
    assert_eq!(content.as_bytes(), data);

    // now test size mismatch
    let target2 = root.join("file2.bin");
    let data2 = b"hi";
    let mut reader2 = Cursor::new(data2.as_ref()).take(data2.len() as u64);
    let res2 = write_file_safe(&target2, root, (data2.len() + 10) as u64, &mut reader2);
    assert!(res2.is_err(), "expected size mismatch error");
}
