use stellar_api::utils::build_globset;

#[test]
fn test_single_pattern_match() {
    let globset = build_globset(&["*.rs"]).unwrap();
    let matcher = globset.matches("main.rs");
    assert!(!matcher.is_empty());
}

#[test]
fn test_single_pattern_no_match() {
    let globset = build_globset(&["*.rs"]).unwrap();
    let matcher = globset.matches("main.txt");
    assert!(matcher.is_empty());
}

#[test]
fn test_multiple_patterns_match() {
    let globset = build_globset(&["*.rs", "*.txt"]).unwrap();
    assert!(globset.is_match("lib.rs"));
    assert!(globset.is_match("readme.txt"));
    assert!(!globset.is_match("image.png"));
}

#[test]
fn test_empty_patterns() {
    let globset = build_globset(&[]).unwrap();
    assert!(!globset.is_match("main.rs"));
}

#[test]
fn test_invalid_pattern() {
    let result = build_globset(&["[invalid"]);
    assert!(result.is_err());
}

#[test]
fn test_directory_pattern() {
    let globset = build_globset(&["src/*"]).unwrap();
    assert!(globset.is_match("src/main.rs"));
    assert!(!globset.is_match("tests/main.rs"));
}

#[test]
fn test_question_mark_pattern() {
    let globset = build_globset(&["file?.rs"]).unwrap();
    assert!(globset.is_match("file1.rs"));
    assert!(globset.is_match("fileA.rs"));
    assert!(!globset.is_match("file10.rs"));
}
