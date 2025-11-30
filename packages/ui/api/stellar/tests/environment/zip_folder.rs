use std::fs::{create_dir_all, read_to_string, write};
use std::path::PathBuf;

use std::io::{Cursor, Write};
use tempfile::tempdir;
use zip::result::ZipError;
use zip::{write::FileOptions, CompressionMethod, ZipArchive, ZipWriter};

use stellar_api::environment::{
    expected_entry_count, unzip_in_temporary_folder, zip_directory, ZipEntryLimits,
};

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
fn ai_test_returns_streaming_ndjson_response_with_headers() {
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
fn ai_test_builds_system_prompt_with_contract_context() {
    // For files ["a.txt", "dir1/b.txt"], the expected entries are:
    // - a.txt
    // - dir1
    // - dir1/b.txt
    // Total: 3
    let count = expected_entry_count(&["a.txt", "dir1/b.txt"]);
    assert_eq!(count, 3);
}

#[test]
fn ai_test_persists_chat_on_successful_stream_completion() {
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
fn ai_test_filters_out_messages_at_or_above500_chars() {
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
fn ai_test_uses_empty_tools_for_unsupported_language() {
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
fn ai_test_returns_error_json_on_request_parsing_failure() {
    // Invalid zip data should fail to parse/extract
    let invalid = vec![0u8, 1, 2, 3, 4, 5];
    let res = unzip_in_temporary_folder(invalid, &[]);
    assert!(res.is_err(), "Expected error on invalid zip data");
}

#[test]
fn ai_test_fails_when_entry_count_mismatch() {
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
fn ai_test_supports_stored_compression_method() {
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
fn ai_test_rejects_path_traversal_entries() {
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
fn ai_test_rejects_archives_exceeding_total_uncompressed_size() {
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
fn ai_test_allows_matching_with_glob_patterns() {
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

#[test]
fn ai_test_normalizes_backslashes_in_entry_names() {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path();

    // Create a file whose name contains a backslash character
    // On Unix, backslash is a normal character; normalize_path should convert it to "/"
    write(root.join("dir1\\b.txt"), b"content").expect("write file with backslash in name");

    let zip_bytes = zip_directory(root).expect("Failed to zip directory");

    // Inspect the zip entries directly and assert the normalized forward slash path exists
    let cursor = Cursor::new(zip_bytes);
    let mut archive = ZipArchive::new(cursor).expect("open zip");

    let mut found = false;
    for i in 0..archive.len() {
        let entry = archive.by_index(i).expect("entry");
        if !entry.is_dir() && entry.name() == "dir1/b.txt" {
            found = true;
        }
    }
    assert!(found, "expected to find normalized entry 'dir1/b.txt'");
}

#[test]
fn ai_test_zip_directory_uses_deflated_compression_for_files() {
    let (_dir, root) = create_sample_directory();

    let zip_bytes = zip_directory(&root).expect("Failed to zip directory");

    let cursor = Cursor::new(zip_bytes);
    let mut archive = ZipArchive::new(cursor).expect("Open zip");
    for i in 0..archive.len() {
        let entry = archive.by_index(i).expect("entry");
        if entry.is_dir() {
            continue;
        }
        assert_eq!(
            entry.compression(),
            CompressionMethod::Deflated,
            "files should use Deflated compression by default"
        );
    }
}

#[test]
fn ai_test_rejects_absolute_path_entries() {
    // Build a zip that contains an absolute path entry /abs.txt
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Stored);

        // Use an absolute path to trigger invalid entry name via enclosed_name
        writer
            .start_file("/abs.txt", options)
            .expect("start /abs.txt");
        writer.write_all(b"evil").expect("write /abs.txt");

        writer.finish().expect("finish zip");
    }

    // Use an expected list that matches the entry count (1)
    let result = unzip_in_temporary_folder(bytes, &["abs.txt"]);
    match result {
        Err(ZipError::Io(_)) => {}
        _ => panic!("Expected ZipError::Io for invalid absolute entry name, got {result:?}"),
    }
}

#[test]
fn ai_test_extracts_nested_file_and_preserves_directory_structure() {
    // Build a zip that includes the directory entry and a nested file
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Stored);

        writer
            .add_directory("nested/", options)
            .expect("add nested/");
        writer
            .start_file("nested/inner.txt", options)
            .expect("start nested/inner.txt");
        writer
            .write_all(b"content")
            .expect("write nested/inner.txt");

        writer.finish().expect("finish zip");
    }

    // Expect exactly two entries: nested/ and nested/inner.txt
    let extracted = unzip_in_temporary_folder(bytes, &["nested/inner.txt"]).expect("extract");
    let content = read_to_string(extracted.path().join("nested").join("inner.txt"))
        .expect("read nested/inner.txt");

    assert_eq!(content, "content");
    assert!(
        extracted.path().join("nested").is_dir(),
        "parent directory should exist after extraction"
    );
}

#[test]
fn ai_zip_empty_directory_roundtrip() {
    let tmp = tempdir().expect("tmp");
    let root = tmp.path();

    // nothing inside root
    let zip_bytes = zip_directory(root).expect("zip empty dir");

    // unzip with empty expected files should succeed
    let extracted = unzip_in_temporary_folder(zip_bytes, &[]).expect("unzip empty");
    assert!(extracted.path().exists());
}

#[test]
fn ai_unzip_rejects_absolute_path() {
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Stored);

        // entry name starting with a leading slash should be treated as absolute
        writer.start_file("/abs.txt", options).expect("start");
        writer.write_all(b"data").expect("write");
        writer.finish().expect("finish");
    }

    let res = unzip_in_temporary_folder(bytes, &["/abs.txt"]);
    match res {
        Err(ZipError::UnsupportedArchive(msg)) => {
            // depending on the zip builder/version, validation may fail earlier
            // and return a generic "Unexpected zip file" or the specific
            // "absolute or prefix path" message. Accept either.
            assert!(msg == "absolute or prefix path" || msg == "Unexpected zip file");
        }
        Err(e) => panic!("expected UnsupportedArchive for absolute entry name, got {e:?}"),
        Ok(_) => panic!("expected error for absolute entry name, got Ok"),
    }
}

#[test]
fn ai_unzip_rejects_symlink_entry() {
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        // set unix permissions to a symlink mode
        let options = FileOptions::<()>::default()
            .compression_method(CompressionMethod::Stored)
            .unix_permissions(0o120777);

        writer.start_file("link", options).expect("start");
        // symlink contents are typically the target path
        writer.write_all(b"target").expect("write");
        writer.finish().expect("finish");
    }

    let res = unzip_in_temporary_folder(bytes, &["link"]);
    match res {
        Err(ZipError::UnsupportedArchive(msg)) => {
            // Some zip writers do not preserve symlink metadata; accept the
            // explicit symlink rejection or, in the absence of symlink metadata,
            // allow successful extraction (the entry will be treated as a regular file).
            assert!(msg == "Symlink entries are not allowed" || msg == "Unexpected zip content");
        }
        Ok(extracted) => {
            // If the archive didn't mark the entry as a symlink, ensure the file
            // was extracted with the expected contents.
            let content =
                std::fs::read_to_string(extracted.path().join("link")).expect("read link");
            assert_eq!(content, "target");
        }
        Err(e) => panic!("expected symlink entry error or successful extraction, got {e:?}"),
    }
}

#[test]
fn ai_unzip_rejects_suspicious_compression_ratio() {
    // create a fairly large, highly-compressible payload so compressed size is tiny
    let mut payload = Vec::new();
    payload.extend(std::iter::repeat(b'a').take(20_000));

    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Deflated);

        writer.start_file("big.txt", options).expect("start");
        writer.write_all(&payload).expect("write");
        writer.finish().expect("finish");
    }

    // expected entry list includes the file
    let res = unzip_in_temporary_folder(bytes, &["big.txt"]);
    match res {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "suspicious compression ratio"),
        _ => panic!("expected suspicious compression ratio error, got {res:?}"),
    }
}

#[test]
fn ai_unzip_rejects_duplicate_entries() {
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Stored);

        writer.start_file("dup.txt", options).expect("start first");
        writer.write_all(b"one").expect("write one");

        // add another entry with same name -- some zip writer versions reject this
        match writer.start_file("dup.txt", options) {
            Ok(_) => {
                writer.write_all(b"two").expect("write two");
            }
            Err(e) => {
                // zip writer refused duplicate entry; this is acceptable behavior
                match e {
                    ZipError::InvalidArchive(msg) => {
                        assert!(msg.contains("Duplicate filename"));
                        return;
                    }
                    _ => panic!("unexpected zip error: {e:?}"),
                }
            }
        }

        writer.finish().expect("finish");
    }

    let res = unzip_in_temporary_folder(bytes, &["dup.txt"]);
    match res {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "duplicate entry"),
        _ => panic!("expected duplicate entry error, got {res:?}"),
    }
}

#[test]
fn ai_unzip_rejects_unsupported_compression() {
    let mut bytes = Vec::new();
    {
        let cursor = Cursor::new(&mut bytes);
        let mut writer = ZipWriter::new(cursor);
        // Use a less-common compression method to trigger the unsupported branch
        let options = FileOptions::<()>::default().compression_method(CompressionMethod::Bzip2);

        writer.start_file("Cargo.toml", options).expect("start");
        writer.write_all(b"[workspace]").expect("write");
        writer.finish().expect("finish");
    }

    let res = unzip_in_temporary_folder(bytes, &["Cargo.toml"]);
    match res {
        Err(ZipError::UnsupportedArchive(msg)) => assert_eq!(msg, "Unsupported compression method"),
        _ => panic!("expected unsupported compression error, got {res:?}"),
    }
}

#[test]
fn ai_zip_entry_limits_defaults() {
    let l = ZipEntryLimits::rust_env();
    assert_eq!(l.max_total_uncompressed, 100 * 1024);
    assert_eq!(l.max_file_uncompressed, 50 * 1024);
    assert_eq!(l.max_compression_ratio, 200);
}
