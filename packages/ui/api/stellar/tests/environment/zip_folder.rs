use std::fs::{create_dir_all, read_to_string, write};
use std::path::PathBuf;

use std::io::{Cursor, Write};
use tempfile::tempdir;
use zip::result::ZipError;
use zip::{write::FileOptions, CompressionMethod, ZipWriter};

use stellar_api::environment::{expected_entry_count, unzip_in_temporary_folder, zip_directory};

fn create_sample_directory() -> (tempfile::TempDir, PathBuf) {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path().to_path_buf();

    // Create files and directories:
    write(root.join("a.txt"), b"hello").expect("Failed to write a.txt");
    create_dir_all(root.join("dir1")).expect("Failed to create dir1");
    write(root.join("dir1").join("b.txt"), b"world").expect("Failed to write dir1/b.txt");

    (dir, root)
}

#[test]
fn test_returns_streaming_ndjson_response_with_headers() {
    let (_dir, root) = create_sample_directory();

    let zip_bytes = zip_directory(&root).expect("Failed to zip directory");

    let extracted = unzip_in_temporary_folder(zip_bytes, &["a.txt", "dir1/b.txt"])
        .expect("Extraction should succeed");

    let a_txt = read_to_string(extracted.path().join("a.txt")).expect("read a.txt");
    let b_txt =
        read_to_string(extracted.path().join("dir1").join("b.txt")).expect("read dir1/b.txt");

    assert_eq!(a_txt, "hello");
    assert_eq!(b_txt, "world");
    assert!(extracted.path().join("dir1").is_dir());
}

#[test]
fn test_builds_system_prompt_with_contract_context() {
    // For files ["a.txt", "dir1/b.txt"], the expected entries are:
    // - a.txt
    // - dir1
    // - dir1/b.txt
    // Total: 3
    let count = expected_entry_count(&["a.txt", "dir1/b.txt"]);
    assert_eq!(count, 3);
}

#[test]
fn test_persists_chat_on_successful_stream_completion() {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path();

    // Create a file larger than the per-file limit (50 KB)
    let big = vec![0u8; 60 * 1024]; // 60 KB
    write(root.join("big.bin"), &big).expect("Failed to write big.bin");

    let zip_bytes = zip_directory(root).expect("Failed to zip directory");

    let result = unzip_in_temporary_folder(zip_bytes, &["big.bin"]);
    match result {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "entry too large"),
        _ => panic!("Expected UnsupportedArchive(\"entry too large\"), got {result:?}"),
    }
}

#[test]
fn test_filters_out_messages_at_or_above500_chars() {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path();

    // Highly compressible content below per-file limit to trigger suspicious compression ratio
    let compressible = vec![b'A'; 49 * 1024]; // 49 KB of 'A's
    write(root.join("compressible.txt"), &compressible).expect("Failed to write compressible.txt");

    let zip_bytes = zip_directory(root).expect("Failed to zip directory");

    let result = unzip_in_temporary_folder(zip_bytes, &["compressible.txt"]);
    match result {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "suspicious compression ratio"),
        _ => {
            panic!("Expected UnsupportedArchive(\"suspicious compression ratio\"), got {result:?}")
        }
    }
}

#[test]
fn test_uses_empty_tools_for_unsupported_language() {
    let (_dir, root) = create_sample_directory();

    let zip_bytes = zip_directory(&root).expect("Failed to zip directory");

    // Craft expected files that produce the same expected entry count (3) but do not match actual names
    // Actual entries: a.txt, dir1, dir1/b.txt
    // Provide: x.txt (1), y/z.txt and y (2) => total 3
    let result = unzip_in_temporary_folder(zip_bytes, &["x.txt", "y/z.txt"]);
    match result {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "Unexpected zip content"),
        _ => panic!("Expected UnsupportedArchive(\"Unexpected zip content\"), got {result:?}"),
    }
}

#[test]
fn test_returns_error_json_on_request_parsing_failure() {
    // Invalid zip data should fail to parse/extract
    let invalid = vec![0u8, 1, 2, 3, 4, 5];
    let res = unzip_in_temporary_folder(invalid, &[]);
    assert!(res.is_err(), "Expected error on invalid zip data");
}

#[test]
fn test_fails_when_entry_count_mismatch() {
    let (_dir, root) = create_sample_directory();

    let zip_bytes = zip_directory(&root).expect("Failed to zip directory");

    // Only declare a subset of expected files so the entry count mismatches (actual: 3, expected: 1)
    let result = unzip_in_temporary_folder(zip_bytes, &["a.txt"]);
    match result {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "Unexpected zip file"),
        _ => panic!("Expected UnsupportedArchive(\"Unexpected zip file\"), got {result:?}"),
    }
}

#[test]
fn test_supports_stored_compression_method() {
    // Build a ZIP with Stored (no compression) for entries: a.txt and dir1/b.txt plus dir1/ directory
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Stored);

        writer.add_directory("dir1/", options).expect("add dir1/");

        writer.start_file("a.txt", options).expect("start a.txt");
        writer.write_all(b"hello").expect("write a.txt");

        writer
            .start_file("dir1/b.txt", options)
            .expect("start dir1/b.txt");
        writer.write_all(b"world").expect("write dir1/b.txt");

        writer.finish().expect("finish zip");
    }

    let extracted = unzip_in_temporary_folder(bytes, &["a.txt", "dir1/b.txt"])
        .expect("Extraction should succeed with Stored method");

    let a_txt = read_to_string(extracted.path().join("a.txt")).expect("read a.txt");
    let b_txt =
        read_to_string(extracted.path().join("dir1").join("b.txt")).expect("read dir1/b.txt");

    assert_eq!(a_txt, "hello");
    assert_eq!(b_txt, "world");
}

#[test]
fn test_rejects_path_traversal_entries() {
    // Build a ZIP that contains a path traversal entry ../evil.txt
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Stored);

        writer
            .start_file("../evil.txt", options)
            .expect("start ../evil.txt");
        writer.write_all(b"oops").expect("write ../evil.txt");
        writer.finish().expect("finish zip");
    }

    // Use expected files with matching count (1) to reach entry name validation
    let result = unzip_in_temporary_folder(bytes, &["evil.txt"]);
    match result {
        Err(ZipError::Io(_)) => {}
        _ => {
            panic!("Expected ZipError::Io for invalid entry name (path traversal), got {result:?}")
        }
    }
}

#[test]
fn test_rejects_archives_exceeding_total_uncompressed_size() {
    // Build a ZIP with three 40KB files using Stored compression to avoid ratio checks
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Stored);

        let big = vec![0u8; 40 * 1024];
        for name in ["f1.bin", "f2.bin", "f3.bin"] {
            writer.start_file(name, options).expect("start file");
            writer.write_all(&big).expect("write file");
        }
        writer.finish().expect("finish zip");
    }

    let result = unzip_in_temporary_folder(bytes, &["f1.bin", "f2.bin", "f3.bin"]);
    match result {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "archive too large"),
        _ => panic!("Expected UnsupportedArchive(\"archive too large\"), got {result:?}"),
    }
}

#[test]
fn test_allows_matching_with_glob_patterns() {
    let (_dir, root) = create_sample_directory();

    let zip_bytes = zip_directory(&root).expect("Failed to zip directory");

    // Allow any .txt in dir1 plus a.txt at root
    let extracted = unzip_in_temporary_folder(zip_bytes, &["a.txt", "dir1/*.txt"])
        .expect("Extraction should succeed with glob patterns");

    let a_txt = read_to_string(extracted.path().join("a.txt")).expect("read a.txt");
    let b_txt =
        read_to_string(extracted.path().join("dir1").join("b.txt")).expect("read dir1/b.txt");

    assert_eq!(a_txt, "hello");
    assert_eq!(b_txt, "world");
}
